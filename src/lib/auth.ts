import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { Role, UserSessionPayload } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'dinedesk_jwt_super_secret_fallback_key';
export const TOKEN_COOKIE_NAME = 'dinedesk_session_token';

export function signToken(payload: UserSessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserSessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSessionPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return payload;
}

export async function requireAuth(allowedRoles?: Role[]) {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }
  return user;
}
