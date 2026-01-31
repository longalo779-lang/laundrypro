'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import OrderStatusBadge, { PaymentStatusBadge } from '@/components/OrderStatusBadge';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: { serviceName: string }[];
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
}

interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minStock: number;
}

interface DashboardData {
  stats: {
    totalOrders: number;
    activeOrders: number;
    readyOrders: number;
    completedOrders: number;
    totalCustomers: number;
    todayOrders: number;
    lowStockItems: number;
  };
  financial: {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
  };
  recentOrders: Order[];
  topCustomers: Customer[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard stats
        const dashboardRes = await fetch('/api/dashboard');
        const dashboardData = await dashboardRes.json();

        if (dashboardData.success) {
          setData(dashboardData.data);
        } else {
          throw new Error(dashboardData.error);
        }

        // Fetch low stock items
        const inventoryRes = await fetch('/api/inventory?lowStock=true');
        const inventoryData = await inventoryRes.json();

        if (inventoryData.success) {
          setLowStockItems(inventoryData.data.filter((item: LowStockItem) => item.stock <= item.minStock));
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: 'var(--foreground-secondary)' }}>Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => window.location.reload()}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Selamat datang kembali! Berikut ringkasan aktivitas laundry Anda.</p>
        </div>
        <div className="quick-actions">
          <Link href="/pos" className="btn btn-primary">
            ➕ Order Baru
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon="📦"
          label="Order Aktif"
          value={data.stats.activeOrders}
          change={data.stats.todayOrders > 0 ? { value: `+${data.stats.todayOrders} hari ini`, positive: true } : undefined}
          gradient="primary"
        />
        <StatCard
          icon="✅"
          label="Siap Diambil"
          value={data.stats.readyOrders}
          gradient="success"
        />
        <StatCard
          icon="💰"
          label="Pendapatan Bulan Ini"
          value={formatCurrency(data.financial.totalIncome)}
          gradient="success"
        />
        <StatCard
          icon="⚠️"
          label="Stok Menipis"
          value={lowStockItems.length}
          gradient={lowStockItems.length > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        {/* Recent Orders */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Order Terbaru</h2>
            <Link href="/orders" style={{ color: 'var(--primary)', fontSize: '14px', textDecoration: 'none' }}>
              Lihat Semua →
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">Belum ada order</div>
              <div className="empty-state-text">Order baru akan muncul di sini</div>
              <Link href="/pos" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Buat Order Pertama
              </Link>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
              <table>
                <thead>
                  <tr>
                    <th>No. Order</th>
                    <th>Pelanggan</th>
                    <th>Layanan</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Pembayaran</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: '500' }}>{order.orderNumber}</td>
                      <td>
                        <div>
                          <div style={{ fontWeight: '500' }}>{order.customerName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>{order.customerPhone}</div>
                        </div>
                      </td>
                      <td>
                        {order.items?.map(item => item.serviceName).join(', ') || '-'}
                      </td>
                      <td>{formatCurrency(order.totalPrice)}</td>
                      <td><OrderStatusBadge status={order.status.toLowerCase() as 'pending' | 'washing' | 'drying' | 'ironing' | 'ready' | 'completed'} /></td>
                      <td><PaymentStatusBadge status={order.paymentStatus.toLowerCase() as 'unpaid' | 'partial' | 'paid'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Stats */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Ringkasan Keuangan</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--foreground-secondary)' }}>Total Pendapatan</span>
                <span style={{ fontWeight: '600', color: 'var(--success)' }}>{formatCurrency(data.financial.totalIncome)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--foreground-secondary)' }}>Total Pengeluaran</span>
                <span style={{ fontWeight: '600', color: 'var(--danger)' }}>{formatCurrency(data.financial.totalExpense)}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600' }}>Laba Bersih</span>
                <span style={{ fontWeight: '700', fontSize: '18px', color: data.financial.netProfit > 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {formatCurrency(data.financial.netProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className="card" style={{ borderColor: 'var(--warning)', background: 'rgba(245, 158, 11, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Stok Menipis</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lowStockItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{item.name}</span>
                    <span className="badge badge-warning">{item.stock} {item.unit}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/inventory"
                className="btn btn-secondary"
                style={{ marginTop: '16px', width: '100%' }}
              >
                Lihat Inventaris
              </Link>
            </div>
          )}

          {/* Top Customers */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Pelanggan Teratas</h3>
            {data.topCustomers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--foreground-secondary)' }}>
                Belum ada data pelanggan
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.topCustomers.map((customer, index) => (
                  <div key={customer.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: index === 0 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                        index === 1 ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' :
                          index === 2 ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' :
                            'var(--background-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>{customer.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>{customer.totalOrders} order</div>
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--success)' }}>
                      {formatCurrency(customer.totalSpent)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats Card */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Statistik</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '12px', background: 'var(--background-tertiary)', borderRadius: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>{data.stats.totalOrders}</div>
                <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>Total Order</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'var(--background-tertiary)', borderRadius: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>{data.stats.completedOrders}</div>
                <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>Selesai Hari Ini</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'var(--background-tertiary)', borderRadius: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent)' }}>{data.stats.totalCustomers}</div>
                <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>Total Pelanggan</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'var(--background-tertiary)', borderRadius: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--info)' }}>{data.stats.todayOrders}</div>
                <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>Order Hari Ini</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
