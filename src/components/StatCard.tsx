'use client';

interface StatCardProps {
    icon: string;
    label: string;
    value: string | number;
    change?: {
        value: string;
        positive: boolean;
    };
    gradient: 'primary' | 'success' | 'warning' | 'danger';
}

export default function StatCard({ icon, label, value, change, gradient }: StatCardProps) {
    const gradientClasses = {
        primary: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    };

    return (
        <div className="stat-card">
            <div
                className="stat-icon"
                style={{ background: gradientClasses[gradient] }}
            >
                {icon}
            </div>
            <div className="stat-content">
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
                {change && (
                    <div className={`stat-change ${change.positive ? 'positive' : 'negative'}`}>
                        {change.positive ? '↑' : '↓'} {change.value}
                    </div>
                )}
            </div>
        </div>
    );
}
