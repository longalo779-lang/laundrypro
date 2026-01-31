'use client';

import { OrderStatus } from '@/types';

interface OrderTimelineProps {
    currentStatus: OrderStatus;
}

const steps: { status: OrderStatus; label: string }[] = [
    { status: 'pending', label: 'Diterima' },
    { status: 'washing', label: 'Dicuci' },
    { status: 'drying', label: 'Pengeringan' },
    { status: 'ironing', label: 'Setrika' },
    { status: 'ready', label: 'Siap' },
    { status: 'completed', label: 'Selesai' },
];

const statusOrder: OrderStatus[] = ['pending', 'washing', 'drying', 'ironing', 'ready', 'completed'];

export default function OrderTimeline({ currentStatus }: OrderTimelineProps) {
    const currentIndex = statusOrder.indexOf(currentStatus);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {steps.map((step, index) => {
                const isActive = index < currentIndex;
                const isCurrent = index === currentIndex;

                return (
                    <div key={step.status} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div
                                className={`status-dot ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                            />
                            <span style={{
                                fontSize: '10px',
                                color: isActive || isCurrent ? 'var(--foreground)' : 'var(--foreground-secondary)',
                                fontWeight: isCurrent ? '600' : '400'
                            }}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`status-connector ${isActive ? 'active' : ''}`}
                                style={{ marginBottom: '18px' }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
