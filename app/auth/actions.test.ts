import { describe, it, expect, vi, beforeEach, type Mock} from 'vitest';
import { signInWithGoogle, signInWithEmail } from './actions';

interface MockSupabaseClient {
  auth: {
    signInWithOAuth: Mock;
    signInWithPassword: Mock;
  };
}

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

function createMockSupabaseClient(): MockSupabaseClient {
  return {
    auth: {
      signInWithOAuth: vi.fn(),
      signInWithPassword: vi.fn(),
    },
  };
}

describe('Auth Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signInWithGoogle', () => {
    it('should redirect to Google OAuth URL on success', async () => {
      const mockHeadersInstance = {
        get: vi.fn().mockReturnValue('http://localhost:3000'),
      };
      vi.mocked(headers).mockResolvedValue(mockHeadersInstance as any);

      const mockSupabase = createMockSupabaseClient();
      const googleOAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?...';
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: googleOAuthUrl },
        error: null,
      });
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);


      await signInWithGoogle();
      expect(headers).toHaveBeenCalled();
      expect(createClient).toHaveBeenCalled();
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      });
      expect(redirect).toHaveBeenCalledWith(googleOAuthUrl);
    });

    it('should redirect to login error page on authentication failure', async () => {
      const mockHeadersInstance = {
        get: vi.fn().mockReturnValue('http://localhost:3000'),
      };
      vi.mocked(headers).mockResolvedValue(mockHeadersInstance as any);

      const mockSupabase = createMockSupabaseClient();
      const errorMessage = 'OAuth configuration is missing';
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      });
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      await signInWithGoogle();
      expect(redirect).toHaveBeenCalledWith(
        '/login?error=Could not authenticate with Google'
      );
    });

    it('should use correct callback URL with different origins', async () => {
      // Test with production URL
      const mockHeadersInstance = {
        get: vi.fn().mockReturnValue('https://finance-buddy.com'),
      };
      vi.mocked(headers).mockResolvedValue(mockHeadersInstance as any);

      const mockSupabase = createMockSupabaseClient();
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://google.com/oauth' },
        error: null,
      });
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      await signInWithGoogle();
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            redirectTo: 'https://finance-buddy.com/auth/callback',
          }),
        })
      );
    });
  });

  describe('signInWithEmail', () => {
    it('should return success when credentials are valid', async () => {
      const mockSupabase = createMockSupabaseClient();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await signInWithEmail('test@example.com', 'password123');
      expect(result).toEqual({ success: true });
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return error when credentials are invalid', async () => {
      const mockSupabase = createMockSupabaseClient();
      const errorMessage = 'Invalid login credentials';
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      });
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await signInWithEmail('test@example.com', 'wrongpassword');

      expect(result).toEqual({
        success: false,
        error: errorMessage,
      });
    });

    it('should handle "Email not confirmed" error', async () => {
      const mockSupabase = createMockSupabaseClient();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Email not confirmed' },
      });
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await signInWithEmail(
        'unconfirmed@example.com',
        'password123'
      );

      expect(result).toEqual({
        success: false,
        error: 'Email not confirmed',
      });
    });

    it('should handle account locked error', async () => {
      const mockSupabase = createMockSupabaseClient();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Too many login attempts. Please try again later.' },
      });
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await signInWithEmail('user@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Too many login attempts');
    });

    it('should handle empty email', async () => {
      const mockSupabase = createMockSupabaseClient();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Email required' },
      });
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await signInWithEmail('', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Email');
    });

    it('should handle empty password', async () => {
      const mockSupabase = createMockSupabaseClient();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Password required' },
      });
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await signInWithEmail('test@example.com', '');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Password');
    });

    it('should handle very long email and password', async () => {
      const mockSupabase = createMockSupabaseClient();
      const longEmail = 'a'.repeat(200) + '@example.com';
      const longPassword = 'x'.repeat(500);

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid email format' },
      });
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await signInWithEmail(longEmail, longPassword);

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled();
      expect(result.success).toBe(false);
    });
  });
});
