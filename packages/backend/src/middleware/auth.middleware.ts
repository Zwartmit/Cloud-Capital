import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/jwt.util.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Token de acceso requerido' });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;

    // Check if account is blocked (with error handling to prevent blocking all requests)
    try {
      const user = await prisma.user.findUnique({
        where: { email: payload.email },
        select: { isBlocked: true, blockedReason: true }
      });

      if (user?.isBlocked) {
        res.status(403).json({
          error: 'Cuenta bloqueada',
          reason: 'Tu cuenta ha sido bloqueada tras aprobar tu solicitud de liquidación. Para reactivar tu cuenta, contacta al soporte.'
        });
        return;
      }
    } catch (dbError) {
      // Log error but don't block the request if DB check fails
      console.error('Error checking blocked status:', dbError);
      // IMPORTANT: Continue with the request
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
    return;
  }
};
