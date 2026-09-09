import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const candidate = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        candidateProfile: true,
        resumes: {
          orderBy: [{ isDefault: 'desc' }, { uploadedAt: 'desc' }],
        },
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: candidate, profile: candidate.candidateProfile });
  } catch (error: any) {
    console.error('Error fetching candidate profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized: Candidate access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      phone,
      avatar,
      headline,
      bio,
      location,
      website,
      github,
      linkedin,
      experienceYears,
      currentCompany,
      currentRole,
      skills,
      education,
      experience,
    } = body;

    // Update user root fields
    if (name || phone !== undefined || avatar !== undefined) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name ? name.trim() : undefined,
          phone: phone !== undefined ? phone : undefined,
          avatar: avatar !== undefined ? avatar : undefined,
        },
      });
    }

    // Upsert candidate profile
    const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : typeof skills === 'string' ? skills : null;
    const educationJson = Array.isArray(education) ? JSON.stringify(education) : typeof education === 'string' ? education : null;
    const experienceJson = Array.isArray(experience) ? JSON.stringify(experience) : typeof experience === 'string' ? experience : null;

    const profile = await prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: {
        headline: headline !== undefined ? headline : undefined,
        bio: bio !== undefined ? bio : undefined,
        location: location !== undefined ? location : undefined,
        website: website !== undefined ? website : undefined,
        github: github !== undefined ? github : undefined,
        linkedin: linkedin !== undefined ? linkedin : undefined,
        experienceYears: experienceYears !== undefined ? parseInt(experienceYears) : undefined,
        currentCompany: currentCompany !== undefined ? currentCompany : undefined,
        currentRole: currentRole !== undefined ? currentRole : undefined,
        skills: skillsJson !== null ? skillsJson : undefined,
        education: educationJson !== null ? educationJson : undefined,
        experience: experienceJson !== null ? experienceJson : undefined,
      },
      create: {
        userId: user.id,
        headline,
        bio,
        location,
        website,
        github,
        linkedin,
        experienceYears: experienceYears ? parseInt(experienceYears) : 0,
        currentCompany,
        currentRole,
        skills: skillsJson || '[]',
        education: educationJson || '[]',
        experience: experienceJson || '[]',
      },
    });

    return NextResponse.json({ message: 'Profile updated successfully', profile });
  } catch (error: any) {
    console.error('Error updating candidate profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
