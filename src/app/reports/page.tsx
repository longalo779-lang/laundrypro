'use client';

import { useState, useEffect } from 'react';

interface Transaction {
    id: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    description: string;
    createdAt: string; // From API
}

interface TopService {
    name: string;
    count: number;
}

interface ReportData {
    transactions: Transaction[];
    summary: {
        totalIncome: number;
        totalExpense: number;
        netProfit: number;
        totalOrders: number;
        completedOrders: number;
        averageOrderValue: number;
        profitMargin: number;
    };
    breakdown: {
        expenses: Record<string, number>;
        topServices: TopService[];
    };
}

export default function ReportsPage() {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    const [transactionType, setTransactionType] = useState<'all' | 'income' | 'expense'>('all');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (date: string | Date) => {
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            if (isNaN(dateObj.getTime())) {
                return 'Invalid Date';
            }
            return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(dateObj);
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports?period=${period}`);
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [period]);

    if (loading) {
        return (
            <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <p style={{ color: 'var(--foreground-secondary)' }}>Memuat laporan keuangan...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const filteredTransactions = data.transactions.filter(t =>
        transactionType === 'all' ||
        (transactionType === 'income' ? t.type === 'INCOME' : t.type === 'EXPENSE')
    );

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Laporan Keuangan</h1>
                <p className="page-subtitle">Analisis pendapatan, pengeluaran, dan laba rugi</p>
            </div>

            {/* Period Tabs */}
            <div className="tabs" style={{ marginBottom: '24px' }}>
                {[
                    { value: 'daily', label: 'Harian' },
                    { value: 'weekly', label: 'Mingguan' },
                    { value: 'monthly', label: 'Bulanan' },
                ].map(tab => (
                    <button
                        key={tab.value}
                        className={`tab ${period === tab.value ? 'active' : ''}`}
                        onClick={() => setPeriod(tab.value as typeof period)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)', borderColor: 'var(--success)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>💰</div>
                        <div>
                            <div style={{ fontSize: '14px', color: 'var(--foreground-secondary)' }}>Total Pendapatan</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--success)' }}>{formatCurrency(data.summary.totalIncome)}</div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)', borderColor: 'var(--danger)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>💸</div>
                        <div>
                            <div style={{ fontSize: '14px', color: 'var(--foreground-secondary)' }}>Total Pengeluaran</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--danger)' }}>{formatCurrency(data.summary.totalExpense)}</div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ background: data.summary.netProfit >= 0 ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)', borderColor: data.summary.netProfit >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: data.summary.netProfit >= 0 ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>📊</div>
                        <div>
                            <div style={{ fontSize: '14px', color: 'var(--foreground-secondary)' }}>Laba Bersih</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: data.summary.netProfit >= 0 ? 'var(--primary)' : 'var(--danger)' }}>{formatCurrency(data.summary.netProfit)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* Transactions List */}
                <div style={{ gridColumn: 'span 2' }}>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Riwayat Transaksi</h2>
                            <div className="tabs">
                                {[
                                    { value: 'all', label: 'Semua' },
                                    { value: 'income', label: 'Pendapatan' },
                                    { value: 'expense', label: 'Pengeluaran' },
                                ].map(tab => (
                                    <button
                                        key={tab.value}
                                        className={`tab ${transactionType === tab.value ? 'active' : ''}`}
                                        onClick={() => setTransactionType(tab.value as typeof transactionType)}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                            {filteredTransactions.length === 0 ? (
                                <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-title">Tidak ada transaksi</div></div>
                            ) : (
                                filteredTransactions.map(transaction => (
                                    <div key={transaction.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--background-tertiary)', borderRadius: '12px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: transaction.type === 'INCOME' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                            {transaction.type === 'INCOME' ? '💰' : '💸'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{transaction.description}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>
                                                {transaction.category} • {formatDate(transaction.createdAt)}
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: '700', fontSize: '16px', color: transaction.type === 'INCOME' ? 'var(--success)' : 'var(--danger)' }}>
                                            {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Expense Breakdown */}
                    <div className="card">
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Rincian Pengeluaran</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {Object.keys(data.breakdown.expenses).length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--foreground-secondary)', padding: '20px' }}>Belum ada pengeluaran</div>
                            ) : (
                                Object.entries(data.breakdown.expenses).map(([category, amount]) => (
                                    <div key={category}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '14px' }}>{category}</span>
                                            <span style={{ fontSize: '14px', fontWeight: '600' }}>{formatCurrency(amount)}</span>
                                        </div>
                                        <div style={{ height: '8px', background: 'var(--background-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${(amount / data.summary.totalExpense) * 100}%`, background: 'linear-gradient(90deg, var(--danger) 0%, #f87171 100%)', borderRadius: '4px' }} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Top Services */}
                    <div className="card">
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Layanan Terlaris</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {data.breakdown.topServices.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--foreground-secondary)', padding: '20px' }}>Belum ada data layanan</div>
                            ) : (
                                data.breakdown.topServices.map((service, index) => (
                                    <div key={service.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: index === 0 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'var(--background-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: index === 0 ? 'white' : 'var(--foreground)' }}>{index + 1}</div>
                                        <div style={{ flex: 1, fontSize: '14px' }}>{service.name}</div>
                                        <span className="badge badge-primary">{service.count}x</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="card">
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Statistik Periode Ini</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-secondary)' }}>Total Order</span><span style={{ fontWeight: '600' }}>{data.summary.totalOrders}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-secondary)' }}>Order Selesai</span><span style={{ fontWeight: '600' }}>{data.summary.completedOrders}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-secondary)' }}>Rata-rata Order</span><span style={{ fontWeight: '600' }}>{formatCurrency(data.summary.averageOrderValue)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--foreground-secondary)' }}>Margin Laba</span><span style={{ fontWeight: '600', color: data.summary.profitMargin >= 0 ? 'var(--success)' : 'var(--danger)' }}>{data.summary.profitMargin.toFixed(1)}%</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
