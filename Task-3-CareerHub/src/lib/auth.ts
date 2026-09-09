import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { Role, UserSessionPayload } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'careerhub_jwt_super_secret_session_key_at_least_32_characters_long';
export const TOKEN_COOKIE_NAME = 'careerhub_session_token';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

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
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    return payload;
  } catch {
    return null;
  }
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
