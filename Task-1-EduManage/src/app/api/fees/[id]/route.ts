import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { paidAmount, paymentMethod, paymentDate, status, remarks } = body;

    const currentFee = await prisma.fee.findUnique({ where: { id: params.id } });
    if (!currentFee) {
      return NextResponse.json({ error: 'Fee record not found' }, { status: 404 });
    }

    const newPaidAmount = paidAmount !== undefined ? Number(paidAmount) : currentFee.paidAmount;
    let computedStatus = status;

    if (!computedStatus) {
      if (newPaidAmount >= currentFee.amount) {
        computedStatus = 'PAID';
      } else if (newPaidAmount > 0) {
        computedStatus = 'PARTIAL';
      } else {
        const isPastDue = new Date() > new Date(currentFee.dueDate);
        computedStatus = isPastDue ? 'OVERDUE' : 'PENDING';
      }
    }

    const updated = await prisma.fee.update({
      where: { id: params.id },
      data: {
        paidAmount: newPaidAmount,
        paymentMethod: paymentMethod || currentFee.paymentMethod,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        status: computedStatus,
        remarks: remarks !== undefined ? remarks : currentFee.remarks,
      },
      include: {
        student: {
          include: {
            user: true,
            class: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, fee: updated });
  } catch (error: any) {
    console.error('Update fee error:', error);
    return NextResponse.json({ error: 'Failed to update fee record' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.fee.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: 'Fee invoice removed' });
  } catch (error: any) {
    console.error('Delete fee error:', error);
    return NextResponse.json({ error: 'Failed to delete fee invoice' }, { status: 500 });
  }
}
