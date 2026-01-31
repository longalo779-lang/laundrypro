import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Ambil semua order
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};

        if (search) {
            where.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { customerName: { contains: search, mode: 'insensitive' } },
                { customerPhone: { contains: search } },
            ];
        }

        if (status && status !== 'all') {
            where.status = status.toUpperCase();
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    items: true,
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                        },
                    },
                },
            }),
            prisma.order.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil data order' },
            { status: 500 }
        );
    }
}

// POST - Buat order baru
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            customerId,
            customerName,
            customerPhone,
            items,
            totalWeight,
            totalPrice,
            discountAmount,
            paymentMethod,
            paymentStatus,
            paidAmount,
            notes,
            estimatedDays,
        } = body;

        if (!customerId || !items || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Data order tidak lengkap' },
                { status: 400 }
            );
        }

        // Generate order number
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const countToday = await prisma.order.count({
            where: {
                createdAt: {
                    gte: new Date(today.setHours(0, 0, 0, 0)),
                },
            },
        });

        const orderNumber = `ORD-${year}${month}${day}-${String(countToday + 1).padStart(3, '0')}`;

        // Calculate estimated completion date
        const estimatedCompletion = new Date();
        estimatedCompletion.setDate(estimatedCompletion.getDate() + (estimatedDays || 2));

        // Calculate final price
        const finalPrice = totalPrice - (discountAmount || 0);

        // Create order with items
        const order = await prisma.order.create({
            data: {
                orderNumber,
                customerId,
                customerName,
                customerPhone,
                totalWeight: totalWeight || 0,
                totalPrice,
                discountAmount: discountAmount || 0,
                finalPrice,
                paymentMethod,
                paymentStatus: paymentStatus === 'paid' ? 'PAID' : paymentStatus === 'partial' ? 'PARTIAL' : 'UNPAID',
                paidAmount: paidAmount || 0,
                notes,
                estimatedCompletion,
                items: {
                    create: items.map((item: {
                        serviceId: string;
                        serviceName: string;
                        quantity: number;
                        weight?: number;
                        pricePerUnit: number;
                        subtotal: number;
                    }) => ({
                        serviceId: item.serviceId,
                        serviceName: item.serviceName,
                        quantity: item.quantity || 1,
                        weight: item.weight,
                        pricePerUnit: item.pricePerUnit,
                        subtotal: item.subtotal,
                    })),
                },
            },
            include: {
                items: true,
                customer: true,
            },
        });

        // Update customer stats
        await prisma.customer.update({
            where: { id: customerId },
            data: {
                totalOrders: { increment: 1 },
                totalSpent: { increment: paidAmount || 0 },
            },
        });

        // Create income transaction
        if (paidAmount && paidAmount > 0) {
            await prisma.transaction.create({
                data: {
                    type: 'INCOME',
                    category: 'Pendapatan Laundry',
                    amount: paidAmount,
                    description: `Pembayaran order ${orderNumber}`,
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: order,
            message: 'Order berhasil dibuat',
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal membuat order' },
            { status: 500 }
        );
    }
}
