import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Ambil order by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        service: true,
                    },
                },
                customer: true,
                payments: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Order tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil data order' },
            { status: 500 }
        );
    }
}

// PUT - Update order (status, payment, etc)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, paymentStatus, paidAmount, notes } = body;

        const updateData: Record<string, unknown> = {};

        if (status) {
            updateData.status = status.toUpperCase();

            // Set completion time if status is COMPLETED
            if (status.toUpperCase() === 'COMPLETED') {
                updateData.completedAt = new Date();
            }
        }

        if (paymentStatus) {
            updateData.paymentStatus = paymentStatus.toUpperCase();
        }

        if (paidAmount !== undefined) {
            updateData.paidAmount = paidAmount;
        }

        if (notes !== undefined) {
            updateData.notes = notes;
        }

        const order = await prisma.order.update({
            where: { id },
            data: updateData,
            include: {
                items: true,
                customer: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: order,
            message: 'Order berhasil diupdate',
        });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengupdate order' },
            { status: 500 }
        );
    }
}

// DELETE - Hapus/batalkan order
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Soft delete - set status to CANCELLED
        const order = await prisma.order.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });

        return NextResponse.json({
            success: true,
            data: order,
            message: 'Order berhasil dibatalkan',
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal membatalkan order' },
            { status: 500 }
        );
    }
}
