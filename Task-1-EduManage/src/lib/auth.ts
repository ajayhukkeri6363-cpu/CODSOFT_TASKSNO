import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'edumanage_jwt_super_secret_fallback_key';
export const TOKEN_COOKIE_NAME = 'edumanage_session_token';

export interface UserSessionPayload {
  id: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  name: string;
  avatar?: string | null;
  teacherId?: string | null;
  studentId?: string | null;
  classId?: string | null;
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
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return payload;
}

export async function requireAuth(allowedRoles?: Array<'ADMIN' | 'TEACHER' | 'STUDENT'>) {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }
  return user;
}
