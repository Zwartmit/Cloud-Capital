import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    res.status(409).json({ error: 'Recurso ya existe' });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({ error: 'Recurso no encontrado' });
    return;
  }

  // Database connection errors
  if (err.code === 'P1001' || (err.message && err.message.includes('connect') && err.message.includes('server'))) {
    res.status(500).json({ error: 'No se puede conectar al servidor de base de datos' });
    return;
  }

  if (err.code === 'P1003' || (err.message && err.message.includes('Database') && err.message.includes('does not exist'))) {
    res.status(500).json({ error: 'La base de datos no existe o no está disponible' });
    return;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ error: 'Token inválido' });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ error: 'Token expirado' });
    return;
  }

  // Auth errors (401 - Unauthorized)
  if (err.message && (
    err.message.includes('Error al iniciar sesión') ||
    err.message.includes('Token') ||
    err.message.includes('no encontrado')
  )) {
    res.status(401).json({ error: err.message });
    return;
  }

  // Validation errors (400 - Bad Request)
  if (err.message && (
    err.message.includes('inválido') ||
    err.message.includes('Ya existe') ||
    err.message.includes('obligatorio')
  )) {
    res.status(400).json({ error: err.message });
    return;
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
  });
};
