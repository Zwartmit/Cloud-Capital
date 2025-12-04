import { PrismaClient, User } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/bcrypt.util.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util.js';

const prisma = new PrismaClient();

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  username: string;
  referralCode: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'> & { referralsCount?: number };
  accessToken: string;
  refreshToken: string;
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        { username: data.username }
      ]
    }
  });

  if (existingUser) {
    throw new Error('Ya existe un usuario con este correo o nombre de usuario');
  }

  // Validate referrer
  const referrer = await prisma.user.findUnique({
    where: { referralCode: data.referralCode }
  });

  if (!referrer) {
    throw new Error('Código de referido inválido');
  }

  // Generate unique referral code for new user
  const { nanoid } = await import('nanoid');
  const newReferralCode = nanoid(8); // 8 characters long

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      username: data.username,
      referralCode: newReferralCode,
      referrerId: referrer.id,
      capitalUSDT: 0,
      currentBalanceUSDT: 0,
    }
  });

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: { ...userWithoutPassword, referralsCount: 0 },
    accessToken,
    refreshToken,
  };
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  // Find user by email or username
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        { username: data.email }
      ]
    }
  });

  if (!user) {
    throw new Error('Error al iniciar sesión. Verifica tus credenciales.');
  }

  // Verify password
  const isPasswordValid = await comparePassword(data.password, user.password);

  if (!isPasswordValid) {
    throw new Error('Error al iniciar sesión. Verifica tus credenciales.');
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Get referral count
  const referralsCount = await prisma.user.count({
    where: { referrerId: user.id }
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: { ...userWithoutPassword, referralsCount },
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  const { verifyRefreshToken } = await import('../utils/jwt.util.js');
  
  try {
    const payload = verifyRefreshToken(refreshToken);
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken };
  } catch (error) {
    throw new Error('Token de actualización inválido');
  }
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    // Don't reveal if user exists or not for security
    return;
  }

  // Generate reset token (valid for 1 hour)
  const resetToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Send email with reset link
  const { sendPasswordResetEmail } = await import('../services/email.service.js');
  await sendPasswordResetEmail(user.email, resetToken);
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const { verifyAccessToken } = await import('../utils/jwt.util.js');
  
  try {
    const payload = verifyAccessToken(token);
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update user password
    await prisma.user.update({
      where: { id: payload.userId },
      data: { password: hashedPassword }
    });
  } catch (error) {
    throw new Error('Token de restablecimiento inválido');
  }
};

