import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

// Check if SMTP is configured
const isSmtpConfigured = config.smtpHost && config.smtpUser && config.smtpPass;

// Create reusable transporter only if SMTP is configured
let transporter: nodemailer.Transporter | null = null;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  if (!isSmtpConfigured || !transporter) {
    console.warn('⚠️  SMTP not configured. Password reset email would be sent to:', email);
    console.warn('📧 Reset URL:', `${config.frontendUrl}/reset-password?token=${resetToken}`);
    // In development, we can still proceed without actually sending the email
    return;
  }

  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: config.emailFrom,
    to: email,
    subject: 'Restablecer contraseña - Cloud Capital',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Cloud Capital</h1>
            <p>Restablecimiento de contraseña</p>
          </div>
          <div class="content">
            <h2>Hola,</h2>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
            <p style="text-align: center">
              <a href="${resetUrl}" class="button" style="color: white;">Restablecer contraseña</a>
            </p>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            <p><strong>Este enlace expirará en 1 hora.</strong></p>
            <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
          </div>
          <div class="footer">
            <p>© 2025 Cloud Capital. Todos los derechos reservados.</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to: ${email}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  if (!isSmtpConfigured || !transporter) {
    console.warn('⚠️  SMTP not configured. Welcome email would be sent to:', email);
    return;
  }

  const mailOptions = {
    from: config.emailFrom,
    to: email,
    subject: 'Bienvenido a Cloud Capital',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a Cloud Capital!</h1>
          </div>
          <div class="content">
            <h2>Hola ${name},</h2>
            <p>Gracias por unirte a Cloud Capital, la plataforma de inversión sostenible en minería de criptomonedas.</p>
            <p>Tu cuenta ha sido creada exitosamente. Ahora puedes:</p>
            <ul>
              <li>Realizar depósitos y comenzar a invertir</li>
              <li>Monitorear tus ganancias en tiempo real</li>
              <li>Retirar tus fondos cuando lo desees</li>
              <li>Acceder a tu panel de control personalizado</li>
            </ul>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p>¡Feliz inversión!</p>
          </div>
          <div class="footer">
            <p>© 2025 Cloud Capital. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to: ${email}`);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't throw error for welcome email, it's not critical
  }
};

