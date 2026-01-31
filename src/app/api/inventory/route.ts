import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Ambil semua item inventaris
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const lowStockOnly = searchParams.get('lowStock') === 'true';

        const where: Record<string, unknown> = {};

        if (category && category !== 'all') {
            where.category = category;
        }

        const items = await prisma.inventoryItem.findMany({
            where,
            orderBy: { name: 'asc' },
        });

        // Filter low stock if needed
        const filteredItems = lowStockOnly
            ? items.filter(item => item.stock <= item.minStock)
            : items;

        // Get stats
        const totalItems = items.length;
        const lowStockItems = items.filter(item => item.stock <= item.minStock).length;
        const totalValue = items.reduce((sum, item) => sum + (item.stock * item.pricePerUnit), 0);

        return NextResponse.json({
            success: true,
            data: filteredItems,
            stats: {
                totalItems,
                lowStockItems,
                totalValue,
            },
        });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil data inventaris' },
            { status: 500 }
        );
    }
}

// POST - Tambah item inventaris baru
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, category, stock, unit, minStock, pricePerUnit } = body;

        if (!name || !category || !unit) {
            return NextResponse.json(
                { success: false, error: 'Data inventaris tidak lengkap' },
                { status: 400 }
            );
        }

        const item = await prisma.inventoryItem.create({
            data: {
                name,
                category,
                stock: parseInt(stock) || 0,
                unit,
                minStock: parseInt(minStock) || 10,
                pricePerUnit: parseFloat(pricePerUnit) || 0,
            },
        });

        // Create initial stock history
        if (stock && stock > 0) {
            await prisma.inventoryHistory.create({
                data: {
                    inventoryItemId: item.id,
                    type: 'IN',
                    quantity: parseInt(stock),
                    notes: 'Stok awal',
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: item,
            message: 'Item inventaris berhasil ditambahkan',
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating inventory item:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal menambah item inventaris' },
            { status: 500 }
        );
    }
}
