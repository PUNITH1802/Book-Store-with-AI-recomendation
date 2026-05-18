import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { AuthService } from '../services/auth.service';
import { User } from '../models/User';

const authService = new AuthService();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/bookcart_test');
  }
});

afterAll(async () => {
  await User.deleteMany({ email: /test-vitest/ });
  await mongoose.disconnect();
});

describe('AuthService', () => {
  const testEmail = `test-vitest-${Date.now()}@bookcart.io`;

  it('registers a new user', async () => {
    const { user, tokens } = await authService.register({
      name: 'Test User',
      email: testEmail,
      password: 'TestPass123!',
    });

    expect(user.email).toBe(testEmail);
    expect(user.name).toBe('Test User');
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
  });

  it('rejects duplicate registration', async () => {
    await expect(
      authService.register({ name: 'Test', email: testEmail, password: 'TestPass123!' }),
    ).rejects.toThrow('Email already registered');
  });

  it('logs in with valid credentials', async () => {
    const { user, tokens } = await authService.login({ email: testEmail, password: 'TestPass123!' });
    expect(user.email).toBe(testEmail);
    expect(tokens.accessToken).toBeDefined();
  });

  it('rejects invalid credentials', async () => {
    await expect(
      authService.login({ email: testEmail, password: 'wrongpassword' }),
    ).rejects.toThrow('Invalid credentials');
  });
});
