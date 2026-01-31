import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Ambil semua layanan
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const activeOnly = searchParams.get('active') !== 'false';

        const where: Record<string, unknown> = {};

        if (category && category !== 'all') {
            where.category = category;
        }

        if (activeOnly) {
            where.isActive = true;
        }

        const services = await prisma.service.findMany({
            where,
            orderBy: [
                { category: 'asc' },
                { name: 'asc' },
            ],
        });

        return NextResponse.json({
            success: true,
            data: services,
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil data layanan' },
            { status: 500 }
        );
    }
}

// POST - Tambah layanan baru
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, price, unit, category, estimatedDays, isActive } = body;

        if (!name || !price || !unit || !category) {
            return NextResponse.json(
                { success: false, error: 'Data layanan tidak lengkap' },
                { status: 400 }
            );
        }

        const service = await prisma.service.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                unit,
                category,
                estimatedDays: parseInt(estimatedDays) || 2,
                isActive: isActive !== false,
            },
        });

        return NextResponse.json({
            success: true,
            data: service,
            message: 'Layanan berhasil ditambahkan',
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating service:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal menambah layanan' },
            { status: 500 }
        );
    }
}
