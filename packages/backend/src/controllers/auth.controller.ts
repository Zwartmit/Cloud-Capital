import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name, username, referralCode } = req.body;

    // Validate input
    if (!email || !password || !name || !username || !referralCode) {
      res.status(400).json({ error: 'Todos los campos son obligatorios' });
      return;
    }

    const result = await authService.register({ email, password, name, username, referralCode });
    res.status(201).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: 'Usuario/Email y contraseña son obligatorios' });
      return;
    }

    const result = await authService.login({ email, password });
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Token de actualización de acceso es requerido' });
      return;
    }

    const result = await authService.refreshAccessToken(refreshToken);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  // In a production app, you would invalidate the refresh token here
  // For now, just return success
  res.status(200).json({ message: 'Cerrando sesión...' });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email es requerido' });
      return;
    }

    await authService.requestPasswordReset(email);
    // Always return success to prevent email enumeration
    res.status(200).json({ message: 'Si existe una cuenta registrada con este correo electrónico, se enviará un enlace para que restablezcas tu contraseña.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al enviar el correo de restablecimiento de contraseña.' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    await authService.resetPassword(token, newPassword);
    res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

