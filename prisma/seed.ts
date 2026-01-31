import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Seed Services
    const services = await Promise.all([
        prisma.service.upsert({
            where: { id: 'svc-regular' },
            update: {},
            create: {
                id: 'svc-regular',
                name: 'Cuci Reguler',
                description: 'Cuci dan kering dalam 2 hari',
                price: 7000,
                unit: 'kg',
                category: 'regular',
                estimatedDays: 2,
            },
        }),
        prisma.service.upsert({
            where: { id: 'svc-express' },
            update: {},
            create: {
                id: 'svc-express',
                name: 'Cuci Express',
                description: 'Cuci dan kering dalam 1 hari',
                price: 12000,
                unit: 'kg',
                category: 'express',
                estimatedDays: 1,
            },
        }),
        prisma.service.upsert({
            where: { id: 'svc-setrika' },
            update: {},
            create: {
                id: 'svc-setrika',
                name: 'Cuci Setrika',
                description: 'Cuci, kering dan setrika rapi',
                price: 10000,
                unit: 'kg',
                category: 'regular',
                estimatedDays: 3,
            },
        }),
        prisma.service.upsert({
            where: { id: 'svc-setrika-only' },
            update: {},
            create: {
                id: 'svc-setrika-only',
                name: 'Setrika Saja',
                description: 'Setrika pakaian kering',
                price: 5000,
                unit: 'kg',
                category: 'regular',
                estimatedDays: 1,
            },
        }),
        prisma.service.upsert({
            where: { id: 'svc-dryclean' },
            update: {},
            create: {
                id: 'svc-dryclean',
                name: 'Dry Clean',
                description: 'Cuci kering untuk pakaian khusus',
                price: 25000,
                unit: 'pcs',
                category: 'premium',
                estimatedDays: 3,
            },
        }),
        prisma.service.upsert({
            where: { id: 'svc-sepatu' },
            update: {},
            create: {
                id: 'svc-sepatu',
                name: 'Cuci Sepatu',
                description: 'Cuci bersih sepatu/sneakers',
                price: 35000,
                unit: 'pasang',
                category: 'specialty',
                estimatedDays: 2,
            },
        }),
        prisma.service.upsert({
            where: { id: 'svc-tas' },
            update: {},
            create: {
                id: 'svc-tas',
                name: 'Cuci Tas',
                description: 'Cuci dan perawatan tas',
                price: 50000,
                unit: 'pcs',
                category: 'specialty',
                estimatedDays: 3,
            },
        }),
        prisma.service.upsert({
            where: { id: 'svc-bedcover' },
            update: {},
            create: {
                id: 'svc-bedcover',
                name: 'Cuci Bed Cover',
                description: 'Cuci bed cover dan sprei',
                price: 30000,
                unit: 'pcs',
                category: 'specialty',
                estimatedDays: 2,
            },
        }),
        prisma.service.upsert({
            where: { id: 'svc-karpet' },
            update: {},
            create: {
                id: 'svc-karpet',
                name: 'Cuci Karpet',
                description: 'Cuci karpet per meter persegi',
                price: 15000,
                unit: 'm2',
                category: 'specialty',
                estimatedDays: 4,
            },
        }),
        prisma.service.upsert({
            where: { id: 'svc-express-setrika' },
            update: {},
            create: {
                id: 'svc-express-setrika',
                name: 'Express Setrika',
                description: 'Cuci setrika dalam 1 hari',
                price: 18000,
                unit: 'kg',
                category: 'express',
                estimatedDays: 1,
            },
        }),
    ]);
    console.log(`✅ ${services.length} services seeded`);

    // Seed Inventory Items
    const inventoryItems = await Promise.all([
        prisma.inventoryItem.upsert({
            where: { id: 'inv-deterjen' },
            update: {},
            create: {
                id: 'inv-deterjen',
                name: 'Deterjen Bubuk',
                category: 'deterjen',
                stock: 50,
                unit: 'kg',
                minStock: 10,
                pricePerUnit: 15000,
            },
        }),
        prisma.inventoryItem.upsert({
            where: { id: 'inv-pewangi' },
            update: {},
            create: {
                id: 'inv-pewangi',
                name: 'Pewangi Laundry',
                category: 'pewangi',
                stock: 30,
                unit: 'liter',
                minStock: 5,
                pricePerUnit: 25000,
            },
        }),
        prisma.inventoryItem.upsert({
            where: { id: 'inv-plastik-kecil' },
            update: {},
            create: {
                id: 'inv-plastik-kecil',
                name: 'Plastik Kemasan Kecil',
                category: 'plastik',
                stock: 500,
                unit: 'pcs',
                minStock: 100,
                pricePerUnit: 200,
            },
        }),
        prisma.inventoryItem.upsert({
            where: { id: 'inv-plastik-besar' },
            update: {},
            create: {
                id: 'inv-plastik-besar',
                name: 'Plastik Kemasan Besar',
                category: 'plastik',
                stock: 300,
                unit: 'pcs',
                minStock: 50,
                pricePerUnit: 500,
            },
        }),
        prisma.inventoryItem.upsert({
            where: { id: 'inv-softener' },
            update: {},
            create: {
                id: 'inv-softener',
                name: 'Softener',
                category: 'pewangi',
                stock: 8,
                unit: 'liter',
                minStock: 10,
                pricePerUnit: 20000,
            },
        }),
    ]);
    console.log(`✅ ${inventoryItems.length} inventory items seeded`);

    // Seed Sample Customer
    const customer = await prisma.customer.upsert({
        where: { phone: '081234567890' },
        update: {},
        create: {
            name: 'Budi Santoso',
            phone: '081234567890',
            email: 'budi@email.com',
            address: 'Jl. Merdeka No. 123, Jakarta',
            preferences: 'Pewangi lavender',
        },
    });
    console.log(`✅ Sample customer seeded`);

    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
