import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Dashboard statistics
export async function GET() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Get all inventory items to calculate low stock
        const inventoryItems = await prisma.inventoryItem.findMany();
        const lowStockCount = inventoryItems.filter(item => item.stock <= item.minStock).length;

        // Parallel queries for better performance
        const [
            totalOrders,
            activeOrders,
            readyOrders,
            completedOrders,
            totalCustomers,
            todayOrders,
            monthlyIncome,
            monthlyExpense,
            recentOrders,
            topCustomers,
        ] = await Promise.all([
            // Total orders
            prisma.order.count(),

            // Active orders (not completed/cancelled)
            prisma.order.count({
                where: {
                    status: { notIn: ['COMPLETED', 'CANCELLED'] },
                },
            }),

            // Ready for pickup
            prisma.order.count({
                where: { status: 'READY' },
            }),

            // Completed today
            prisma.order.count({
                where: {
                    status: 'COMPLETED',
                    completedAt: { gte: today },
                },
            }),

            // Total customers
            prisma.customer.count(),

            // Today's orders
            prisma.order.count({
                where: { createdAt: { gte: today } },
            }),

            // Monthly income
            prisma.transaction.aggregate({
                where: {
                    type: 'INCOME',
                    createdAt: { gte: startOfMonth },
                },
                _sum: { amount: true },
            }),

            // Monthly expense
            prisma.transaction.aggregate({
                where: {
                    type: 'EXPENSE',
                    createdAt: { gte: startOfMonth },
                },
                _sum: { amount: true },
            }),

            // Recent orders with items
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    orderNumber: true,
                    customerName: true,
                    customerPhone: true,
                    totalPrice: true,
                    status: true,
                    paymentStatus: true,
                    createdAt: true,
                    items: {
                        select: {
                            serviceName: true,
                        },
                    },
                },
            }),

            // Top customers
            prisma.customer.findMany({
                take: 5,
                orderBy: { totalSpent: 'desc' },
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    totalOrders: true,
                    totalSpent: true,
                },
            }),
        ]);

        const totalIncome = monthlyIncome._sum?.amount ?? 0;
        const totalExpense = monthlyExpense._sum?.amount ?? 0;
        const netProfit = totalIncome - totalExpense;

        return NextResponse.json({
            success: true,
            data: {
                stats: {
                    totalOrders,
                    activeOrders,
                    readyOrders,
                    completedOrders,
                    totalCustomers,
                    todayOrders,
                    lowStockItems: lowStockCount,
                },
                financial: {
                    totalIncome,
                    totalExpense,
                    netProfit,
                },
                recentOrders,
                topCustomers,
            },
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil statistik dashboard' },
            { status: 500 }
        );
    }
}
