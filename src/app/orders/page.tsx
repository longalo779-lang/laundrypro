'use client';

import { useState, useEffect, useMemo } from 'react';
import OrderStatusBadge, { PaymentStatusBadge } from '@/components/OrderStatusBadge';
import OrderTimeline from '@/components/OrderTimeline';
import Modal from '@/components/Modal';
import { Order, OrderStatus } from '@/types';

interface OrderItem {
    id: string;
    serviceName: string;
    quantity: number;
    weight?: number;
    pricePerUnit: number;
    subtotal: number;
}

interface OrderData {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    items: OrderItem[];
    totalWeight: number;
    totalPrice: number;
    status: string;
    paymentStatus: string;
    notes?: string;
    createdAt: string;
    estimatedCompletion: string;
    completedAt?: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: string | Date) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date));
    };

    // Fetch orders from API
    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch =
                order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customerPhone.includes(searchQuery);
            const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchQuery, statusFilter]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();

            if (data.success) {
                // Update local state
                setOrders(prev => prev.map(order =>
                    order.id === orderId ? { ...order, status: data.data.status, completedAt: data.data.completedAt } : order
                ));
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: data.data.status, completedAt: data.data.completedAt });
                }
            } else {
                alert(data.error || 'Gagal mengupdate status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Terjadi kesalahan saat mengupdate status');
        } finally {
            setIsUpdating(false);
        }
    };

    const statusCounts = useMemo(() => {
        return {
            all: orders.length,
            pending: orders.filter(o => o.status === 'PENDING').length,
            washing: orders.filter(o => o.status === 'WASHING').length,
            drying: orders.filter(o => o.status === 'DRYING').length,
            ironing: orders.filter(o => o.status === 'IRONING').length,
            ready: orders.filter(o => o.status === 'READY').length,
            completed: orders.filter(o => o.status === 'COMPLETED').length,
        };
    }, [orders]);

    const getNextStatus = (currentStatus: string): string | null => {
        const statusFlow: Record<string, string | null> = {
            PENDING: 'WASHING',
            WASHING: 'DRYING',
            DRYING: 'IRONING',
            IRONING: 'READY',
            READY: 'COMPLETED',
            COMPLETED: null,
            CANCELLED: null,
        };
        return statusFlow[currentStatus] || null;
    };

    const getStatusLabel = (status: string): string => {
        const labels: Record<string, string> = {
            WASHING: 'Dicuci',
            DRYING: 'Dikeringkan',
            IRONING: 'Disetrika',
            READY: 'Siap Diambil',
            COMPLETED: 'Selesai',
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <p style={{ color: 'var(--foreground-secondary)' }}>Memuat data order...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Manajemen Order</h1>
                <p className="page-subtitle">Kelola dan pantau semua order laundry Anda</p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div className="search-box" style={{ flex: 1, minWidth: '300px' }}>
                    <span className="search-box-icon">🔍</span>
                    <input
                        type="text"
                        className="input"
                        placeholder="Cari nomor order, nama, atau telepon..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="btn btn-secondary" onClick={fetchOrders}>
                    🔄 Refresh
                </button>
            </div>

            {/* Status Tabs */}
            <div className="tabs" style={{ marginBottom: '24px', overflowX: 'auto' }}>
                {[
                    { value: 'all', label: 'Semua' },
                    { value: 'pending', label: 'Menunggu' },
                    { value: 'washing', label: 'Dicuci' },
                    { value: 'drying', label: 'Dikeringkan' },
                    { value: 'ironing', label: 'Disetrika' },
                    { value: 'ready', label: 'Siap Diambil' },
                    { value: 'completed', label: 'Selesai' },
                ].map(tab => (
                    <button
                        key={tab.value}
                        className={`tab ${statusFilter === tab.value ? 'active' : ''}`}
                        onClick={() => setStatusFilter(tab.value)}
                    >
                        {tab.label} ({statusCounts[tab.value as keyof typeof statusCounts]})
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>No. Order</th>
                            <th>Pelanggan</th>
                            <th>Layanan</th>
                            <th>Berat/Qty</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Pembayaran</th>
                            <th>Tanggal</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                                    <div className="empty-state">
                                        <div className="empty-state-icon">📦</div>
                                        <div className="empty-state-title">Tidak ada order</div>
                                        <div className="empty-state-text">Belum ada order yang sesuai dengan filter Anda</div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td>
                                        <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{order.orderNumber}</span>
                                    </td>
                                    <td>
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{order.customerName}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>{order.customerPhone}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ maxWidth: '200px' }}>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} style={{ fontSize: '13px' }}>
                                                    {item.serviceName}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        {order.totalWeight > 0 ? `${order.totalWeight} kg` : '-'}
                                        {order.items.filter(i => !i.weight).length > 0 && (
                                            <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>
                                                +{order.items.filter(i => !i.weight).reduce((sum, i) => sum + i.quantity, 0)} pcs
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ fontWeight: '600' }}>{formatCurrency(order.totalPrice)}</td>
                                    <td><OrderStatusBadge status={order.status.toLowerCase() as OrderStatus} /></td>
                                    <td><PaymentStatusBadge status={order.paymentStatus.toLowerCase() as 'unpaid' | 'partial' | 'paid'} /></td>
                                    <td style={{ fontSize: '13px', color: 'var(--foreground-secondary)' }}>
                                        {formatDate(order.createdAt)}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn btn-icon btn-secondary"
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setIsDetailModalOpen(true);
                                                }}
                                                title="Lihat Detail"
                                            >
                                                👁️
                                            </button>
                                            {getNextStatus(order.status) && (
                                                <button
                                                    className="btn btn-icon btn-primary"
                                                    onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                                                    title="Update Status"
                                                    disabled={isUpdating}
                                                >
                                                    {isUpdating ? '⏳' : '➡️'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Order Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Detail Order"
                size="lg"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setIsDetailModalOpen(false)}>
                            Tutup
                        </button>
                        {selectedOrder && getNextStatus(selectedOrder.status) && (
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    handleStatusUpdate(selectedOrder.id, getNextStatus(selectedOrder.status)!);
                                }}
                                disabled={isUpdating}
                            >
                                {isUpdating ? '⏳ Memproses...' : `Update ke ${getStatusLabel(getNextStatus(selectedOrder.status)!)}`}
                            </button>
                        )}
                    </>
                }
            >
                {selectedOrder && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Order Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                                    {selectedOrder.orderNumber}
                                </h3>
                                <p style={{ color: 'var(--foreground-secondary)', fontSize: '14px' }}>
                                    Dibuat: {formatDate(selectedOrder.createdAt)}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <OrderStatusBadge status={selectedOrder.status.toLowerCase() as OrderStatus} />
                                <PaymentStatusBadge status={selectedOrder.paymentStatus.toLowerCase() as 'unpaid' | 'partial' | 'paid'} />
                            </div>
                        </div>

                        {/* Timeline */}
                        <div style={{ background: 'var(--background-tertiary)', padding: '20px', borderRadius: '12px' }}>
                            <OrderTimeline currentStatus={selectedOrder.status.toLowerCase() as OrderStatus} />
                        </div>

                        {/* Customer Info */}
                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--foreground-secondary)' }}>
                                INFORMASI PELANGGAN
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>Nama</div>
                                    <div style={{ fontWeight: '500' }}>{selectedOrder.customerName}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>Telepon</div>
                                    <div style={{ fontWeight: '500' }}>{selectedOrder.customerPhone}</div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--foreground-secondary)' }}>
                                DETAIL LAYANAN
                            </h4>
                            <div style={{ background: 'var(--background-tertiary)', borderRadius: '12px', overflow: 'hidden' }}>
                                {selectedOrder.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '16px',
                                            borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid var(--border)' : 'none'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{item.serviceName}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>
                                                {item.weight ? `${item.weight} kg x ${formatCurrency(item.pricePerUnit)}` :
                                                    `${item.quantity} pcs x ${formatCurrency(item.pricePerUnit)}`}
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: '600' }}>{formatCurrency(item.subtotal)}</div>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--background-secondary)' }}>
                                    <div style={{ fontWeight: '600' }}>Total</div>
                                    <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--primary)' }}>
                                        {formatCurrency(selectedOrder.totalPrice)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {selectedOrder.notes && (
                            <div>
                                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--foreground-secondary)' }}>
                                    CATATAN
                                </h4>
                                <div style={{ background: 'var(--background-tertiary)', padding: '16px', borderRadius: '12px' }}>
                                    {selectedOrder.notes}
                                </div>
                            </div>
                        )}

                        {/* Dates */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)', marginBottom: '4px' }}>
                                    Estimasi Selesai
                                </div>
                                <div style={{ fontWeight: '500' }}>{formatDate(selectedOrder.estimatedCompletion)}</div>
                            </div>
                            {selectedOrder.completedAt && (
                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)', marginBottom: '4px' }}>
                                        Selesai Pada
                                    </div>
                                    <div style={{ fontWeight: '500', color: 'var(--success)' }}>{formatDate(selectedOrder.completedAt)}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
