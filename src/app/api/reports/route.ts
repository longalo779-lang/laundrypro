import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Transaction, Order, OrderItem } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'monthly'; // daily, weekly, monthly

        let startDate = new Date();
        const now = new Date();

        if (period === 'daily') {
            startDate = new Date(now.setHours(0, 0, 0, 0));
        } else if (period === 'weekly') {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            startDate = new Date(now.setDate(diff));
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'monthly') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // 1. Fetch Transactions
        const transactions: Transaction[] = await prisma.transaction.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // 2. Fetch Orders for Top Services
        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
            include: {
                items: true,
            },
        });

        // 3. Calculate Summary Stats
        const totalIncome = transactions
            .filter((t: Transaction) => t.type === 'INCOME')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter((t: Transaction) => t.type === 'EXPENSE')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        const netProfit = totalIncome - totalExpense;

        // 4. Calculate Expense Breakdown
        const expenseByCategory = transactions
            .filter((t: Transaction) => t.type === 'EXPENSE')
            .reduce((acc: Record<string, number>, t: Transaction) => {
                const category = t.category || 'Lainnya';
                acc[category] = (acc[category] || 0) + t.amount;
                return acc;
            }, {});

        // 5. Calculate Top Services
        const serviceCount = orders
            .flatMap((o) => o.items)
            .reduce((acc: Record<string, number>, item: OrderItem) => {
                const name = item.serviceName;
                acc[name] = (acc[name] || 0) + item.quantity;
                return acc;
            }, {});

        const topServices = Object.entries(serviceCount)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        // 6. Quick Stats
        const totalOrders = orders.length;
        const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;
        const averageOrderValue = totalOrders > 0 ? totalIncome / totalOrders : 0;
        const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

        return NextResponse.json({
            success: true,
            data: {
                transactions,
                summary: {
                    totalIncome,
                    totalExpense,
                    netProfit,
                    totalOrders,
                    completedOrders,
                    averageOrderValue,
                    profitMargin,
                },
                breakdown: {
                    expenses: expenseByCategory,
                    topServices,
                },
            },
        });

    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil data laporan' },
            { status: 500 }
        );
    }
}
