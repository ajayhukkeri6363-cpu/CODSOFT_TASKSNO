import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { storage } from '@/lib/storage';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
      where: { candidateId: user.id },
      orderBy: [{ isDefault: 'desc' }, { uploadedAt: 'desc' }],
    });

    return NextResponse.json({ resumes });
  } catch (error: any) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch resumes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized: Only candidates can upload resumes' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read bytes into Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await storage.uploadResume(buffer, file.name, file.type);

    // If candidate has no default resume, make this default
    const existingCount = await prisma.resume.count({
      where: { candidateId: user.id },
    });

    const isDefault = existingCount === 0;

    const resume = await prisma.resume.create({
      data: {
        candidateId: user.id,
        fileName: uploadResult.fileName,
        fileUrl: uploadResult.fileUrl,
        storageKey: uploadResult.storageKey,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType,
        isDefault,
      },
    });

    return NextResponse.json({ message: 'Resume uploaded successfully', resume }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading resume:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload resume' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // Set all other resumes of this candidate to not default
    await prisma.resume.updateMany({
      where: { candidateId: user.id },
      data: { isDefault: false },
    });

    // Set selected to default
    const updated = await prisma.resume.update({
      where: { id: resumeId },
      data: { isDefault: true },
    });

    return NextResponse.json({ message: 'Default resume updated', resume: updated });
  } catch (error: any) {
    console.error('Error setting default resume:', error);
    return NextResponse.json({ error: error.message || 'Failed to update default resume' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get('id');

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume || resume.candidateId !== user.id) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (resume.storageKey) {
      await storage.deleteResume(resume.storageKey);
    }

    await prisma.resume.delete({
      where: { id: resumeId },
    });

    return NextResponse.json({ message: 'Resume deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting resume:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete resume' }, { status: 500 });
  }
}
