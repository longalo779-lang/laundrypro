'use client';

import { useState, useEffect, useMemo } from 'react';
import Modal from '@/components/Modal';

interface CustomerData {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    preferences?: string;
    totalOrders: number;
    totalSpent: number;
    createdAt: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<CustomerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        preferences: '',
    });

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
            month: 'long',
            year: 'numeric',
        }).format(new Date(date));
    };

    // Fetch customers from API
    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            const data = await res.json();
            if (data.success) {
                setCustomers(data.data);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.phone.includes(searchQuery) ||
            (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [customers, searchQuery]);

    const stats = useMemo(() => {
        return {
            totalCustomers: customers.length,
            totalOrders: customers.reduce((sum, c) => sum + c.totalOrders, 0),
            totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
        };
    }, [customers]);

    const handleAddCustomer = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email || undefined,
                    address: formData.address || undefined,
                    preferences: formData.preferences || undefined,
                }),
            });
            const data = await res.json();

            if (data.success) {
                setCustomers([...customers, data.data]);
                setFormData({ name: '', phone: '', email: '', address: '', preferences: '' });
                setIsAddModalOpen(false);
            } else {
                alert(data.error || 'Gagal menambah pelanggan');
            }
        } catch (error) {
            console.error('Error adding customer:', error);
            alert('Terjadi kesalahan saat menambah pelanggan');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEditCustomer = async () => {
        if (!selectedCustomer) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/customers/${selectedCustomer.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email || undefined,
                    address: formData.address || undefined,
                    preferences: formData.preferences || undefined,
                }),
            });
            const data = await res.json();

            if (data.success) {
                setCustomers(customers.map(c =>
                    c.id === selectedCustomer.id ? data.data : c
                ));
                setIsEditModalOpen(false);
                setSelectedCustomer(null);
                setFormData({ name: '', phone: '', email: '', address: '', preferences: '' });
            } else {
                alert(data.error || 'Gagal mengupdate pelanggan');
            }
        } catch (error) {
            console.error('Error updating customer:', error);
            alert('Terjadi kesalahan saat mengupdate pelanggan');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteCustomer = async (customer: CustomerData) => {
        if (!confirm(`Yakin ingin menghapus pelanggan "${customer.name}"?`)) return;

        try {
            const res = await fetch(`/api/customers/${customer.id}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (data.success) {
                setCustomers(customers.filter(c => c.id !== customer.id));
            } else {
                alert(data.error || 'Gagal menghapus pelanggan');
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('Terjadi kesalahan saat menghapus pelanggan');
        }
    };

    const openEditModal = (customer: CustomerData) => {
        setSelectedCustomer(customer);
        setFormData({
            name: customer.name,
            phone: customer.phone,
            email: customer.email || '',
            address: customer.address || '',
            preferences: customer.preferences || '',
        });
        setIsEditModalOpen(true);
    };

    if (loading) {
        return (
            <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <p style={{ color: 'var(--foreground-secondary)' }}>Memuat data pelanggan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Manajemen Pelanggan</h1>
                    <p className="page-subtitle">Kelola data pelanggan dan riwayat order mereka</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={fetchCustomers}>
                        🔄 Refresh
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                        ➕ Tambah Pelanggan
                    </button>
                </div>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '24px' }}>
                <div className="search-box" style={{ maxWidth: '400px' }}>
                    <span className="search-box-icon">🔍</span>
                    <input
                        type="text"
                        className="input"
                        placeholder="Cari nama, telepon, atau email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalCustomers}</div>
                    <div style={{ fontSize: '14px', color: 'var(--foreground-secondary)' }}>Total Pelanggan</div>
                </div>
                <div className="card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700' }}>
                        {stats.totalOrders}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--foreground-secondary)' }}>Total Order</div>
                </div>
                <div className="card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>
                        {formatCurrency(stats.totalSpent)}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--foreground-secondary)' }}>Total Transaksi</div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Pelanggan</th>
                            <th>Kontak</th>
                            <th>Alamat</th>
                            <th>Total Order</th>
                            <th>Total Transaksi</th>
                            <th>Bergabung</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                                    <div className="empty-state">
                                        <div className="empty-state-icon">👥</div>
                                        <div className="empty-state-title">Tidak ada pelanggan</div>
                                        <div className="empty-state-text">Belum ada pelanggan yang terdaftar</div>
                                        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                                            Tambah Pelanggan Pertama
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <tr key={customer.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                color: 'white'
                                            }}>
                                                {customer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{customer.name}</div>
                                                {customer.preferences && (
                                                    <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>
                                                        ⭐ {customer.preferences}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <div>📱 {customer.phone}</div>
                                            {customer.email && (
                                                <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>
                                                    ✉️ {customer.email}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ maxWidth: '200px' }}>
                                        {customer.address || '-'}
                                    </td>
                                    <td>
                                        <span className="badge badge-primary">{customer.totalOrders} order</span>
                                    </td>
                                    <td style={{ fontWeight: '600', color: 'var(--success)' }}>
                                        {formatCurrency(customer.totalSpent)}
                                    </td>
                                    <td style={{ fontSize: '13px', color: 'var(--foreground-secondary)' }}>
                                        {formatDate(customer.createdAt)}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn btn-icon btn-secondary"
                                                onClick={() => openEditModal(customer)}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-icon btn-secondary"
                                                onClick={() => handleDeleteCustomer(customer)}
                                                title="Hapus"
                                                style={{ color: 'var(--danger)' }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Customer Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setFormData({ name: '', phone: '', email: '', address: '', preferences: '' });
                }}
                title="Tambah Pelanggan Baru"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)} disabled={isProcessing}>
                            Batal
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleAddCustomer}
                            disabled={!formData.name || !formData.phone || isProcessing}
                        >
                            {isProcessing ? '⏳ Menyimpan...' : 'Simpan'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label className="input-label">Nama Lengkap *</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Masukkan nama pelanggan"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="input-label">Nomor Telepon *</label>
                        <input
                            type="tel"
                            className="input"
                            placeholder="Contoh: 081234567890"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="input-label">Email</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="Contoh: email@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="input-label">Alamat</label>
                        <textarea
                            className="input"
                            placeholder="Masukkan alamat lengkap"
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            style={{ resize: 'vertical' }}
                        />
                    </div>
                    <div>
                        <label className="input-label">Preferensi Layanan</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Contoh: Pewangi lavender, pisahkan pakaian putih"
                            value={formData.preferences}
                            onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                        />
                    </div>
                </div>
            </Modal>

            {/* Edit Customer Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCustomer(null);
                    setFormData({ name: '', phone: '', email: '', address: '', preferences: '' });
                }}
                title="Edit Pelanggan"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)} disabled={isProcessing}>
                            Batal
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleEditCustomer}
                            disabled={!formData.name || !formData.phone || isProcessing}
                        >
                            {isProcessing ? '⏳ Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label className="input-label">Nama Lengkap *</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Masukkan nama pelanggan"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="input-label">Nomor Telepon *</label>
                        <input
                            type="tel"
                            className="input"
                            placeholder="Contoh: 081234567890"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="input-label">Email</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="Contoh: email@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="input-label">Alamat</label>
                        <textarea
                            className="input"
                            placeholder="Masukkan alamat lengkap"
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            style={{ resize: 'vertical' }}
                        />
                    </div>
                    <div>
                        <label className="input-label">Preferensi Layanan</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Contoh: Pewangi lavender, pisahkan pakaian putih"
                            value={formData.preferences}
                            onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
