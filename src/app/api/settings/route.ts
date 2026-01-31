import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Ambil settings toko
export async function GET() {
    try {
        // Ambil settings pertama, atau buat jika belum ada
        let settings = await prisma.settings.findFirst();

        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    businessName: 'LaundryPro',
                    address: 'Jl. Contoh No. 123, Jakarta',
                    phone: '08123456789',
                    email: 'info@laundrypro.com',
                    receiptFooter: 'Terima kasih atas kepercayaan Anda!',
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: settings,
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil pengaturan' },
            { status: 500 }
        );
    }
}

// PUT - Update settings toko
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { businessName, address, phone, email, receiptFooter } = body;

        // Ambil settings yang ada
        const existingSettings = await prisma.settings.findFirst();

        let settings;
        if (existingSettings) {
            // Update settings yang ada
            settings = await prisma.settings.update({
                where: { id: existingSettings.id },
                data: {
                    businessName,
                    address,
                    phone,
                    email,
                    receiptFooter,
                },
            });
        } else {
            // Buat settings baru jika belum ada
            settings = await prisma.settings.create({
                data: {
                    businessName,
                    address,
                    phone,
                    email,
                    receiptFooter,
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: settings,
            message: 'Pengaturan berhasil disimpan',
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal menyimpan pengaturan' },
            { status: 500 }
        );
    }
}
