import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Ambil detail layanan by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const service = await prisma.service.findUnique({
            where: { id },
        });

        if (!service) {
            return NextResponse.json(
                { success: false, error: 'Layanan tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: service,
        });
    } catch (error) {
        console.error('Error fetching service:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil detail layanan' },
            { status: 500 }
        );
    }
}

// PUT - Update layanan
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, description, price, unit, category, estimatedDays, isActive } = body;

        const service = await prisma.service.update({
            where: { id },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                unit,
                category,
                estimatedDays: estimatedDays ? parseInt(estimatedDays) : undefined,
                isActive,
            },
        });

        return NextResponse.json({
            success: true,
            data: service,
            message: 'Layanan berhasil diupdate',
        });
    } catch (error) {
        console.error('Error updating service:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengupdate layanan' },
            { status: 500 }
        );
    }
}

// DELETE - Hapus layanan
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Cek apakah layanan sudah digunakan di OrderItem (opsional, tapi disarankan)
        const usedInOrders = await prisma.orderItem.findFirst({
            where: { serviceId: id },
        });

        if (usedInOrders) {
            // Jika sudah digunakan, sebaiknya soft delete (non-aktifkan) saja
            // Tapi jika user memaksa delete, Prisma akan error constraint jika tidak cascade
            // Disini kita ubah jadi non-aktif saja agar data histori aman
            const service = await prisma.service.update({
                where: { id },
                data: { isActive: false },
            });

            return NextResponse.json({
                success: true,
                message: 'Layanan dinonaktifkan karena sudah memiliki riwayat transaksi',
                data: service,
                action: 'deactivated'
            });
        }

        await prisma.service.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Layanan berhasil dihapus permanen',
            action: 'deleted'
        });
    } catch (error) {
        console.error('Error deleting service:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal menghapus layanan' },
            { status: 500 }
        );
    }
}
