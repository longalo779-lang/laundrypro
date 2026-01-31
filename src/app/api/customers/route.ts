import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Ambil semua pelanggan
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const where = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { phone: { contains: search } },
                { email: { contains: search, mode: 'insensitive' as const } },
            ],
        } : {};

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    _count: {
                        select: { orders: true }
                    }
                }
            }),
            prisma.customer.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: customers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil data pelanggan' },
            { status: 500 }
        );
    }
}

// POST - Tambah pelanggan baru
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, phone, email, address, preferences } = body;

        if (!name || !phone) {
            return NextResponse.json(
                { success: false, error: 'Nama dan nomor telepon wajib diisi' },
                { status: 400 }
            );
        }

        // Check if phone already exists
        const existingCustomer = await prisma.customer.findUnique({
            where: { phone },
        });

        if (existingCustomer) {
            return NextResponse.json(
                { success: false, error: 'Nomor telepon sudah terdaftar' },
                { status: 400 }
            );
        }

        const customer = await prisma.customer.create({
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
            message: 'Pelanggan berhasil ditambahkan',
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal menambah pelanggan' },
            { status: 500 }
        );
    }
}
