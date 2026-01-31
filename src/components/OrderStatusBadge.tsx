'use client';

import { OrderStatus } from '@/types';

interface OrderStatusBadgeProps {
    status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
    pending: { label: 'Menunggu', className: 'badge-warning' },
    washing: { label: 'Dicuci', className: 'badge-info' },
    drying: { label: 'Dikeringkan', className: 'badge-info' },
    ironing: { label: 'Disetrika', className: 'badge-primary' },
    ready: { label: 'Siap Diambil', className: 'badge-success' },
    completed: { label: 'Selesai', className: 'badge-success' },
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span className={`badge ${config.className}`}>
            {config.label}
        </span>
    );
}

export function PaymentStatusBadge({ status }: { status: 'unpaid' | 'partial' | 'paid' }) {
    const config = {
        unpaid: { label: 'Belum Bayar', className: 'badge-danger' },
        partial: { label: 'Sebagian', className: 'badge-warning' },
        paid: { label: 'Lunas', className: 'badge-success' },
    };

    return (
        <span className={`badge ${config[status].className}`}>
            {config[status].label}
        </span>
    );
}
