import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { UserRole } from '../constants/roles';
import { emailQueue } from '../queues/email.queue';
import type { JwtPayload } from '../middlewares/authenticate';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private signAccess(userId: string, role: UserRole): string {
    return jwt.sign({ sub: userId, role } as Omit<JwtPayload, 'iat' | 'exp'>, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  private signRefresh(userId: string): string {
    return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  async register(input: RegisterInput): Promise<{ user: typeof User.prototype; tokens: TokenPair }> {
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) throw ApiError.conflict('Email already registered');

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      ...input,
      emailVerificationToken: verificationToken,
    });

    await emailQueue.add('verify-email', {
      to: user.email,
      name: user.name,
      token: verificationToken,
    });

    const tokens = await this.generateTokenPair(user);
    return { user, tokens };
  }

  async login(input: LoginInput): Promise<{ user: typeof User.prototype; tokens: TokenPair }> {
    const user = await User.findOne({ email: input.email.toLowerCase() }).select('+password +refreshTokens');
    if (!user) throw ApiError.unauthorized('Invalid credentials');

    if (user.isLocked()) throw ApiError.unauthorized('Account temporarily locked. Try again later.');
    if (!user.isActive) throw ApiError.unauthorized('Account disabled');

    const valid = await user.comparePassword(input.password);
    if (!valid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      throw ApiError.unauthorized('Invalid credentials');
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;

    const tokens = await this.generateTokenPair(user);
    return { user, tokens };
  }

  async refresh(token: string): Promise<TokenPair> {
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const user = await User.findById(payload.sub).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(token)) {
      throw ApiError.unauthorized('Refresh token revoked');
    }

    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    const tokens = await this.generateTokenPair(user);
    return tokens;
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) throw ApiError.badRequest('Invalid or expired verification token');

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return; // silently ignore to prevent enumeration

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    await emailQueue.add('reset-password', {
      to: user.email,
      name: user.name,
      token: resetToken,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) throw ApiError.badRequest('Invalid or expired reset token');

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = [];
    await user.save();
  }

  private async generateTokenPair(user: InstanceType<typeof User>): Promise<TokenPair> {
    const accessToken = this.signAccess(user.id as string, user.role);
    const refreshToken = this.signRefresh(user.id as string);

    user.refreshTokens = [...(user.refreshTokens ?? []).slice(-4), refreshToken];
    await user.save();

    return { accessToken, refreshToken };
  }
}
