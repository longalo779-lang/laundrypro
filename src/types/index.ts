// Types for Laundry Application

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    totalOrders: number;
    totalSpent: number;
    createdAt: Date;
    preferences?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    items: OrderItem[];
    totalWeight: number;
    totalPrice: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    notes?: string;
    createdAt: Date;
    estimatedCompletion: Date;
    completedAt?: Date;
    pickedUpAt?: Date;
}

export interface OrderItem {
    id: string;
    serviceId: string;
    serviceName: string;
    quantity: number;
    weight?: number;
    pricePerUnit: number;
    subtotal: number;
}

export type OrderStatus = 'pending' | 'washing' | 'drying' | 'ironing' | 'ready' | 'completed';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export type PaymentMethod = 'cash' | 'transfer' | 'ewallet' | 'card';

export interface Service {
    id: string;
    name: string;
    description?: string;
    price: number;
    unit: 'kg' | 'pcs' | 'set';
    estimatedDays: number;
    category: ServiceCategory;
    isActive: boolean;
}

export type ServiceCategory = 'regular' | 'express' | 'premium' | 'specialty';

export interface InventoryItem {
    id: string;
    name: string;
    category: InventoryCategory;
    quantity: number;
    unit: string;
    minStock: number;
    pricePerUnit: number;
    supplier?: string;
    lastRestocked?: Date;
}

export type InventoryCategory = 'detergent' | 'softener' | 'bleach' | 'stain_remover' | 'packaging' | 'other';

export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description: string;
    orderId?: string;
    date: Date;
    paymentMethod?: PaymentMethod;
}

export interface DashboardStats {
    todayOrders: number;
    todayRevenue: number;
    pendingOrders: number;
    completedToday: number;
    weeklyOrders: number;
    weeklyRevenue: number;
    monthlyOrders: number;
    monthlyRevenue: number;
}

export interface ReportData {
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate: Date;
    endDate: Date;
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    orderCount: number;
    averageOrderValue: number;
    topServices: { name: string; count: number; revenue: number }[];
    revenueByDay: { date: string; amount: number }[];
}

export interface Notification {
    id: string;
    orderId: string;
    customerId: string;
    type: 'order_ready' | 'order_completed' | 'reminder';
    message: string;
    sentVia?: 'sms' | 'whatsapp';
    sentAt?: Date;
    status: 'pending' | 'sent' | 'failed';
}
