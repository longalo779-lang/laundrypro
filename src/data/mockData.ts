import { Customer, Order, Service, InventoryItem, Transaction } from '@/types';

// Mock Services
export const mockServices: Service[] = [
    {
        id: '1',
        name: 'Cuci Reguler',
        description: 'Cuci, keringkan, dan lipat pakaian',
        price: 7000,
        unit: 'kg',
        estimatedDays: 3,
        category: 'regular',
        isActive: true,
    },
    {
        id: '2',
        name: 'Cuci Express',
        description: 'Layanan cuci kilat selesai dalam 1 hari',
        price: 12000,
        unit: 'kg',
        estimatedDays: 1,
        category: 'express',
        isActive: true,
    },
    {
        id: '3',
        name: 'Cuci Setrika',
        description: 'Cuci, keringkan, setrika, dan lipat',
        price: 10000,
        unit: 'kg',
        estimatedDays: 3,
        category: 'regular',
        isActive: true,
    },
    {
        id: '4',
        name: 'Setrika Saja',
        description: 'Layanan setrika tanpa cuci',
        price: 5000,
        unit: 'kg',
        estimatedDays: 2,
        category: 'regular',
        isActive: true,
    },
    {
        id: '5',
        name: 'Dry Clean',
        description: 'Pembersihan kering untuk pakaian khusus',
        price: 25000,
        unit: 'pcs',
        estimatedDays: 4,
        category: 'premium',
        isActive: true,
    },
    {
        id: '6',
        name: 'Cuci Sepatu',
        description: 'Cuci dan perawatan sepatu',
        price: 35000,
        unit: 'pcs',
        estimatedDays: 3,
        category: 'specialty',
        isActive: true,
    },
    {
        id: '7',
        name: 'Cuci Tas',
        description: 'Cuci dan perawatan tas',
        price: 40000,
        unit: 'pcs',
        estimatedDays: 4,
        category: 'specialty',
        isActive: true,
    },
    {
        id: '8',
        name: 'Cuci Bed Cover',
        description: 'Cuci bed cover dan sprei',
        price: 30000,
        unit: 'set',
        estimatedDays: 3,
        category: 'specialty',
        isActive: true,
    },
    {
        id: '9',
        name: 'Cuci Karpet',
        description: 'Cuci dan pembersihan karpet',
        price: 50000,
        unit: 'pcs',
        estimatedDays: 5,
        category: 'specialty',
        isActive: true,
    },
    {
        id: '10',
        name: 'Express Setrika',
        description: 'Layanan setrika kilat selesai dalam 6 jam',
        price: 15000,
        unit: 'kg',
        estimatedDays: 1,
        category: 'express',
        isActive: true,
    },
];

// Mock Customers
export const mockCustomers: Customer[] = [
    {
        id: '1',
        name: 'Budi Santoso',
        phone: '081234567890',
        email: 'budi.santoso@email.com',
        address: 'Jl. Merdeka No. 123, Jakarta',
        totalOrders: 15,
        totalSpent: 750000,
        createdAt: new Date('2024-01-15'),
        preferences: 'Pewangi lavender',
    },
    {
        id: '2',
        name: 'Siti Rahayu',
        phone: '082345678901',
        email: 'siti.rahayu@email.com',
        address: 'Jl. Sudirman No. 45, Jakarta',
        totalOrders: 8,
        totalSpent: 420000,
        createdAt: new Date('2024-02-20'),
        preferences: 'Tanpa pewangi',
    },
    {
        id: '3',
        name: 'Ahmad Wijaya',
        phone: '083456789012',
        address: 'Jl. Gatot Subroto No. 78, Jakarta',
        totalOrders: 22,
        totalSpent: 1250000,
        createdAt: new Date('2023-11-10'),
    },
    {
        id: '4',
        name: 'Dewi Lestari',
        phone: '084567890123',
        email: 'dewi.lestari@email.com',
        address: 'Jl. Thamrin No. 56, Jakarta',
        totalOrders: 5,
        totalSpent: 280000,
        createdAt: new Date('2024-03-05'),
        preferences: 'Pisahkan pakaian putih',
    },
    {
        id: '5',
        name: 'Rudi Hermawan',
        phone: '085678901234',
        address: 'Jl. Kuningan No. 90, Jakarta',
        totalOrders: 12,
        totalSpent: 680000,
        createdAt: new Date('2024-01-25'),
    },
];

// Mock Orders
export const mockOrders: Order[] = [
    {
        id: '1',
        orderNumber: 'ORD-2024-001',
        customerId: '1',
        customerName: 'Budi Santoso',
        customerPhone: '081234567890',
        items: [
            { id: '1', serviceId: '3', serviceName: 'Cuci Setrika', quantity: 1, weight: 5, pricePerUnit: 10000, subtotal: 50000 },
        ],
        totalWeight: 5,
        totalPrice: 50000,
        status: 'ready',
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        createdAt: new Date('2024-03-20T10:00:00'),
        estimatedCompletion: new Date('2024-03-23T18:00:00'),
    },
    {
        id: '2',
        orderNumber: 'ORD-2024-002',
        customerId: '2',
        customerName: 'Siti Rahayu',
        customerPhone: '082345678901',
        items: [
            { id: '1', serviceId: '2', serviceName: 'Cuci Express', quantity: 1, weight: 3, pricePerUnit: 12000, subtotal: 36000 },
            { id: '2', serviceId: '6', serviceName: 'Cuci Sepatu', quantity: 2, pricePerUnit: 35000, subtotal: 70000 },
        ],
        totalWeight: 3,
        totalPrice: 106000,
        status: 'washing',
        paymentStatus: 'unpaid',
        notes: 'Sepatu warna putih, hati-hati',
        createdAt: new Date('2024-03-21T14:30:00'),
        estimatedCompletion: new Date('2024-03-22T18:00:00'),
    },
    {
        id: '3',
        orderNumber: 'ORD-2024-003',
        customerId: '3',
        customerName: 'Ahmad Wijaya',
        customerPhone: '083456789012',
        items: [
            { id: '1', serviceId: '1', serviceName: 'Cuci Reguler', quantity: 1, weight: 8, pricePerUnit: 7000, subtotal: 56000 },
        ],
        totalWeight: 8,
        totalPrice: 56000,
        status: 'drying',
        paymentStatus: 'paid',
        paymentMethod: 'transfer',
        createdAt: new Date('2024-03-21T09:15:00'),
        estimatedCompletion: new Date('2024-03-24T18:00:00'),
    },
    {
        id: '4',
        orderNumber: 'ORD-2024-004',
        customerId: '4',
        customerName: 'Dewi Lestari',
        customerPhone: '084567890123',
        items: [
            { id: '1', serviceId: '5', serviceName: 'Dry Clean', quantity: 3, pricePerUnit: 25000, subtotal: 75000 },
        ],
        totalWeight: 0,
        totalPrice: 75000,
        status: 'pending',
        paymentStatus: 'partial',
        notes: 'Jas dan gaun pesta',
        createdAt: new Date('2024-03-22T11:00:00'),
        estimatedCompletion: new Date('2024-03-26T18:00:00'),
    },
    {
        id: '5',
        orderNumber: 'ORD-2024-005',
        customerId: '5',
        customerName: 'Rudi Hermawan',
        customerPhone: '085678901234',
        items: [
            { id: '1', serviceId: '8', serviceName: 'Cuci Bed Cover', quantity: 2, pricePerUnit: 30000, subtotal: 60000 },
            { id: '2', serviceId: '3', serviceName: 'Cuci Setrika', quantity: 1, weight: 4, pricePerUnit: 10000, subtotal: 40000 },
        ],
        totalWeight: 4,
        totalPrice: 100000,
        status: 'ironing',
        paymentStatus: 'paid',
        paymentMethod: 'ewallet',
        createdAt: new Date('2024-03-20T16:45:00'),
        estimatedCompletion: new Date('2024-03-23T18:00:00'),
    },
    {
        id: '6',
        orderNumber: 'ORD-2024-006',
        customerId: '1',
        customerName: 'Budi Santoso',
        customerPhone: '081234567890',
        items: [
            { id: '1', serviceId: '9', serviceName: 'Cuci Karpet', quantity: 1, pricePerUnit: 50000, subtotal: 50000 },
        ],
        totalWeight: 0,
        totalPrice: 50000,
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        createdAt: new Date('2024-03-18T10:00:00'),
        estimatedCompletion: new Date('2024-03-23T18:00:00'),
        completedAt: new Date('2024-03-22T14:00:00'),
        pickedUpAt: new Date('2024-03-22T17:30:00'),
    },
];

// Mock Inventory
export const mockInventory: InventoryItem[] = [
    {
        id: '1',
        name: 'Deterjen Bubuk',
        category: 'detergent',
        quantity: 25,
        unit: 'kg',
        minStock: 10,
        pricePerUnit: 15000,
        supplier: 'PT Sabun Bersih',
        lastRestocked: new Date('2024-03-15'),
    },
    {
        id: '2',
        name: 'Deterjen Cair',
        category: 'detergent',
        quantity: 15,
        unit: 'liter',
        minStock: 5,
        pricePerUnit: 25000,
        supplier: 'PT Sabun Bersih',
        lastRestocked: new Date('2024-03-18'),
    },
    {
        id: '3',
        name: 'Pewangi Lavender',
        category: 'softener',
        quantity: 8,
        unit: 'liter',
        minStock: 3,
        pricePerUnit: 35000,
        supplier: 'CV Wangi Sejati',
        lastRestocked: new Date('2024-03-10'),
    },
    {
        id: '4',
        name: 'Pewangi Fresh',
        category: 'softener',
        quantity: 10,
        unit: 'liter',
        minStock: 3,
        pricePerUnit: 35000,
        supplier: 'CV Wangi Sejati',
        lastRestocked: new Date('2024-03-10'),
    },
    {
        id: '5',
        name: 'Pemutih',
        category: 'bleach',
        quantity: 5,
        unit: 'liter',
        minStock: 2,
        pricePerUnit: 20000,
        supplier: 'PT Sabun Bersih',
        lastRestocked: new Date('2024-03-12'),
    },
    {
        id: '6',
        name: 'Penghilang Noda',
        category: 'stain_remover',
        quantity: 3,
        unit: 'botol',
        minStock: 2,
        pricePerUnit: 45000,
        supplier: 'PT Clean Pro',
        lastRestocked: new Date('2024-03-08'),
    },
    {
        id: '7',
        name: 'Plastik Kemasan',
        category: 'packaging',
        quantity: 500,
        unit: 'lembar',
        minStock: 100,
        pricePerUnit: 200,
        supplier: 'UD Plastik Jaya',
        lastRestocked: new Date('2024-03-20'),
    },
    {
        id: '8',
        name: 'Hanger Plastik',
        category: 'packaging',
        quantity: 150,
        unit: 'pcs',
        minStock: 50,
        pricePerUnit: 2500,
        supplier: 'UD Plastik Jaya',
        lastRestocked: new Date('2024-03-05'),
    },
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
    {
        id: '1',
        type: 'income',
        category: 'Pembayaran Order',
        amount: 50000,
        description: 'Pembayaran ORD-2024-001',
        orderId: '1',
        date: new Date('2024-03-20T10:30:00'),
        paymentMethod: 'cash',
    },
    {
        id: '2',
        type: 'income',
        category: 'Pembayaran Order',
        amount: 56000,
        description: 'Pembayaran ORD-2024-003',
        orderId: '3',
        date: new Date('2024-03-21T09:30:00'),
        paymentMethod: 'transfer',
    },
    {
        id: '3',
        type: 'income',
        category: 'Pembayaran Order',
        amount: 100000,
        description: 'Pembayaran ORD-2024-005',
        orderId: '5',
        date: new Date('2024-03-20T17:00:00'),
        paymentMethod: 'ewallet',
    },
    {
        id: '4',
        type: 'expense',
        category: 'Bahan Baku',
        amount: 375000,
        description: 'Pembelian deterjen bubuk 25kg',
        date: new Date('2024-03-15T14:00:00'),
    },
    {
        id: '5',
        type: 'expense',
        category: 'Bahan Baku',
        amount: 280000,
        description: 'Pembelian pewangi 8 liter',
        date: new Date('2024-03-10T11:00:00'),
    },
    {
        id: '6',
        type: 'expense',
        category: 'Operasional',
        amount: 500000,
        description: 'Tagihan listrik bulan Maret',
        date: new Date('2024-03-05T09:00:00'),
    },
    {
        id: '7',
        type: 'expense',
        category: 'Operasional',
        amount: 150000,
        description: 'Tagihan air bulan Maret',
        date: new Date('2024-03-05T09:15:00'),
    },
    {
        id: '8',
        type: 'income',
        category: 'Pembayaran Order',
        amount: 50000,
        description: 'Pembayaran ORD-2024-006',
        orderId: '6',
        date: new Date('2024-03-22T14:30:00'),
        paymentMethod: 'cash',
    },
    {
        id: '9',
        type: 'income',
        category: 'Pembayaran Sebagian',
        amount: 40000,
        description: 'DP Pembayaran ORD-2024-004',
        orderId: '4',
        date: new Date('2024-03-22T11:15:00'),
        paymentMethod: 'cash',
    },
    {
        id: '10',
        type: 'expense',
        category: 'Gaji Karyawan',
        amount: 3000000,
        description: 'Gaji karyawan bulan Maret',
        date: new Date('2024-03-01T10:00:00'),
    },
];

// Helper functions
export const getOrdersByStatus = (status: string) => {
    return mockOrders.filter(order => order.status === status);
};

export const getCustomerById = (id: string) => {
    return mockCustomers.find(customer => customer.id === id);
};

export const getLowStockItems = () => {
    return mockInventory.filter(item => item.quantity <= item.minStock);
};

export const getTodayOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return mockOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
    });
};

export const calculateDashboardStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = mockOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
    });

    const todayRevenue = mockTransactions
        .filter(t => {
            const tDate = new Date(t.date);
            tDate.setHours(0, 0, 0, 0);
            return t.type === 'income' && tDate.getTime() === today.getTime();
        })
        .reduce((sum, t) => sum + t.amount, 0);

    return {
        todayOrders: todayOrders.length,
        todayRevenue,
        pendingOrders: mockOrders.filter(o => o.status !== 'completed').length,
        completedToday: todayOrders.filter(o => o.status === 'completed').length,
        weeklyOrders: mockOrders.length,
        weeklyRevenue: mockTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        monthlyOrders: mockOrders.length,
        monthlyRevenue: mockTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    };
};
