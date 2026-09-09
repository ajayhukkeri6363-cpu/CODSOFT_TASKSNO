import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, TOKEN_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, role = 'CANDIDATE', phone, companyName, position } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    if (!['CANDIDATE', 'RECRUITER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role for public registration' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let existingUser = null;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch (dbErr: any) {
      console.warn('Registration schema init notice:', dbErr?.message);
      const { ensureTablesExist } = await import('@/lib/seed');
      await ensureTablesExist();
      existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    }

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    let companyId: string | undefined = undefined;

    if (role === 'RECRUITER') {
      const finalCompanyName = companyName?.trim() || `${name}'s Organization`;
      const slug = finalCompanyName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

      const newCompany = await prisma.company.create({
        data: {
          name: finalCompanyName,
          slug,
          industry: 'Technology & Software',
          location: 'San Francisco, CA',
        },
      });
      companyId = newCompany.id;
    }

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        role,
        phone: phone || null,
        candidateProfile:
          role === 'CANDIDATE'
            ? {
                create: {
                  headline: 'Software Professional',
                  bio: 'Passionate talent exploring new career opportunities.',
                },
              }
            : undefined,
        recruiterProfile:
          role === 'RECRUITER' && companyId
            ? {
                create: {
                  companyId,
                  position: position || 'Talent Acquisition Partner',
                  department: 'Talent Acquisition',
                },
              }
            : undefined,
      },
    });

    const sessionPayload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as any,
      phone: newUser.phone,
      companyId: companyId || null,
    };

    const token = signToken(sessionPayload);

    // Set cookie
    cookies().set(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json(
      {
        message: 'Account registered successfully',
        user: sessionPayload,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Server error during registration' }, { status: 500 });
  }
}
