import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';

const authService = new AuthService();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(64),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class AuthController {
  register = async (req: Request, res: Response): Promise<void> => {
    const input = registerSchema.parse(req.body);
    const { user, tokens } = await authService.register(input);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    ApiResponse.created(res, { user, accessToken: tokens.accessToken }, 'Account created');
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const input = loginSchema.parse(req.body);
    const { user, tokens } = await authService.login(input);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    ApiResponse.success(res, { user, accessToken: tokens.accessToken }, 'Login successful');
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    if (req.user && refreshToken) {
      await authService.logout(req.user.sub, refreshToken);
    }
    res.clearCookie('refreshToken');
    ApiResponse.noContent(res);
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const token = (req.cookies.refreshToken ?? req.body.refreshToken) as string;
    if (!token) {
      res.status(401).json({ success: false, message: 'No refresh token' });
      return;
    }

    const tokens = await authService.refresh(token);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    ApiResponse.success(res, { accessToken: tokens.accessToken }, 'Token refreshed');
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    await authService.forgotPassword(email);
    ApiResponse.success(res, null, 'If that email exists, a reset link was sent');
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { token, password } = z
      .object({ token: z.string(), password: z.string().min(8) })
      .parse(req.body);
    await authService.resetPassword(token, password);
    ApiResponse.success(res, null, 'Password reset successful');
  };

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const { token } = z.object({ token: z.string() }).parse(req.body);
    await authService.verifyEmail(token);
    ApiResponse.success(res, null, 'Email verified');
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const { User } = await import('../models/User');
    const user = await User.findById(req.user!.sub).lean();
    ApiResponse.success(res, user);
  };
}
