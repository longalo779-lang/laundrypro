import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Get inventory item by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const item = await prisma.inventoryItem.findUnique({
            where: { id },
            include: {
                stockHistory: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!item) {
            return NextResponse.json(
                { success: false, error: 'Item tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: item,
        });
    } catch (error) {
        console.error('Error fetching inventory item:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil data item' },
            { status: 500 }
        );
    }
}

// PUT - Update inventory item
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { stock, name, category, unit, minStock, pricePerUnit, type, quantity, notes } = body;

        const updateData: Record<string, unknown> = {};

        if (name !== undefined) updateData.name = name;
        if (category !== undefined) updateData.category = category;
        if (unit !== undefined) updateData.unit = unit;
        if (minStock !== undefined) updateData.minStock = minStock;
        if (pricePerUnit !== undefined) updateData.pricePerUnit = pricePerUnit;
        if (stock !== undefined) updateData.stock = stock;

        const item = await prisma.inventoryItem.update({
            where: { id },
            data: updateData,
        });

        // Record stock history if this is a stock movement
        if (type && quantity) {
            await prisma.inventoryHistory.create({
                data: {
                    inventoryItemId: id,
                    type: type, // 'IN', 'OUT', 'ADJUSTMENT'
                    quantity: quantity,
                    notes: notes || null,
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: item,
            message: 'Item berhasil diupdate',
        });
    } catch (error) {
        console.error('Error updating inventory item:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengupdate item' },
            { status: 500 }
        );
    }
}

// DELETE - Delete inventory item
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.inventoryItem.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Item berhasil dihapus',
        });
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal menghapus item' },
            { status: 500 }
        );
    }
}
