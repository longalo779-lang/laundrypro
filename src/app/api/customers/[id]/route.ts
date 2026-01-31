import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Ambil pelanggan by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!customer) {
            return NextResponse.json(
                { success: false, error: 'Pelanggan tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: customer,
        });
    } catch (error) {
        console.error('Error fetching customer:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil data pelanggan' },
            { status: 500 }
        );
    }
}

// PUT - Update pelanggan
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, phone, email, address, preferences } = body;

        const customer = await prisma.customer.update({
            where: { id },
            data: {
                name,
                phone,
                email,
                address,
                preferences,
            },
        });

        return NextResponse.json({
            success: true,
            data: customer,
            message: 'Pelanggan berhasil diupdate',
        });
    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengupdate pelanggan' },
            { status: 500 }
        );
    }
}

// DELETE - Hapus pelanggan
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.customer.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Pelanggan berhasil dihapus',
        });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal menghapus pelanggan' },
            { status: 500 }
        );
    }
}
