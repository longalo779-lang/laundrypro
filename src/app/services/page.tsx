'use client';

import { useState, useEffect, useMemo } from 'react';
import Modal from '@/components/Modal';

interface ServiceData {
    id: string;
    name: string;
    description?: string;
    price: number;
    unit: string;
    category: string;
    estimatedDays: number;
    isActive: boolean;
}

export default function ServicesPage() {
    const [services, setServices] = useState<ServiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        unit: 'kg',
        category: 'regular',
        estimatedDays: '2',
        isActive: true,
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const categories = [
        { value: 'all', label: 'Semua Kategori' },
        { value: 'regular', label: 'Reguler (Kiloan)' },
        { value: 'express', label: 'Express' },
        { value: 'specialty', label: 'Satuan (Baju, Karpet, dll)' },
        { value: 'premium', label: 'Premium / Dry Clean' },
    ];

    const fetchServices = async () => {
        setLoading(true);
        try {
            // Fetch all services, including inactive ones
            const res = await fetch('/api/services?active=false');
            const data = await res.json();
            if (data.success) {
                setServices(data.data);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [services, searchQuery, categoryFilter]);

    const handleAddService = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    estimatedDays: parseInt(formData.estimatedDays),
                }),
            });
            const data = await res.json();

            if (data.success) {
                setServices([...services, data.data]);
                setIsAddModalOpen(false);
                resetForm();
            } else {
                alert(data.error || 'Gagal menambah layanan');
            }
        } catch (error) {
            console.error('Error adding service:', error);
            alert('Terjadi kesalahan saat menambah layanan');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEditService = async () => {
        if (!selectedService) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/services/${selectedService.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    estimatedDays: parseInt(formData.estimatedDays),
                }),
            });
            const data = await res.json();

            if (data.success) {
                setServices(services.map(s => s.id === selectedService.id ? data.data : s));
                setIsEditModalOpen(false);
                setSelectedService(null);
                resetForm();
            } else {
                alert(data.error || 'Gagal mengupdate layanan');
            }
        } catch (error) {
            console.error('Error updating service:', error);
            alert('Terjadi kesalahan saat mengupdate layanan');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteService = async (service: ServiceData) => {
        if (!confirm(`Yakin ingin menghapus layanan "${service.name}"? Jika sudah ada transaksi, layanan hanya akan dinonaktifkan.`)) return;

        try {
            const res = await fetch(`/api/services/${service.id}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (data.success) {
                if (data.action === 'deleted') {
                    setServices(services.filter(s => s.id !== service.id));
                } else {
                    // Refresh data to show updated 'isActive' status
                    fetchServices();
                    alert(data.message);
                }
            } else {
                alert(data.error || 'Gagal menghapus layanan');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
        }
    };

    const openEditModal = (service: ServiceData) => {
        setSelectedService(service);
        setFormData({
            name: service.name,
            description: service.description || '',
            price: String(service.price),
            unit: service.unit,
            category: service.category,
            estimatedDays: String(service.estimatedDays),
            isActive: service.isActive,
        });
        setIsEditModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            unit: 'kg',
            category: 'regular',
            estimatedDays: '2',
            isActive: true,
        });
    };

    const getCategoryBadgeColor = (category: string) => {
        const colors: Record<string, string> = {
            regular: 'var(--primary)',
            express: 'var(--warning)',
            specialty: 'var(--secondary)',
            premium: '#8b5cf6', // purple
        };
        return colors[category] || 'var(--foreground-secondary)';
    };

    if (loading) {
        return (
            <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <p style={{ color: 'var(--foreground-secondary)' }}>Memuat data layanan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Manajemen Layanan</h1>
                    <p className="page-subtitle">Atur harga dan jenis layanan laundry Anda</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={fetchServices}>
                        🔄 Refresh
                    </button>
                    <button className="btn btn-primary" onClick={() => { resetForm(); setIsAddModalOpen(true); }}>
                        ➕ Tambah Layanan
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div className="search-box" style={{ flex: 1, minWidth: '300px' }}>
                    <span className="search-box-icon">🔍</span>
                    <input
                        type="text"
                        className="input"
                        placeholder="Cari nama layanan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="select"
                    style={{ width: '250px' }}
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </select>
            </div>

            {/* Services Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nama Layanan</th>
                            <th>Kategori</th>
                            <th>Harga</th>
                            <th>Satuan</th>
                            <th>Estimasi</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredServices.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                                    <div className="empty-state">
                                        <div className="empty-state-icon">🏷️</div>
                                        <div className="empty-state-title">Tidak ada layanan</div>
                                        <div className="empty-state-text">Belum ada layanan yang sesuai filter Anda</div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredServices.map((service) => (
                                <tr key={service.id} style={{ opacity: service.isActive ? 1 : 0.6 }}>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{service.name}</div>
                                        {service.description && (
                                            <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>
                                                {service.description}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span
                                            className="badge"
                                            style={{
                                                background: getCategoryBadgeColor(service.category),
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                fontSize: '12px'
                                            }}
                                        >
                                            {service.category.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: '600' }}>{formatCurrency(service.price)}</td>
                                    <td>per {service.unit}</td>
                                    <td>{service.estimatedDays} hari</td>
                                    <td>
                                        <span className={`badge ${service.isActive ? 'badge-success' : 'badge-danger'}`}>
                                            {service.isActive ? 'Aktif' : 'Non-Aktif'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn btn-icon btn-secondary"
                                                onClick={() => openEditModal(service)}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-icon btn-secondary"
                                                onClick={() => handleDeleteService(service)}
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

            {/* Modal Form Content */}
            {/* Shared content for Add and Edit Modals */}
            <Modal
                isOpen={isAddModalOpen || isEditModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                }}
                title={isAddModalOpen ? "Tambah Layanan Baru" : "Edit Layanan"}
                footer={
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setIsAddModalOpen(false);
                                setIsEditModalOpen(false);
                            }}
                            disabled={isProcessing}
                        >
                            Batal
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={isAddModalOpen ? handleAddService : handleEditService}
                            disabled={!formData.name || !formData.price || isProcessing}
                        >
                            {isProcessing ? '⏳ Menyimpan...' : 'Simpan'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label className="input-label">Nama Layanan *</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Contoh: Cuci Komplit Reguler"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="input-label">Deskripsi</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Contoh: Cuci + Kering + Setrika"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label className="input-label">Kategori</label>
                            <select
                                className="select"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.filter(c => c.value !== 'all').map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Estimasi Pengerjaan (Hari)</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.estimatedDays}
                                onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label className="input-label">Harga (Rp) *</label>
                            <input
                                type="number"
                                className="input"
                                placeholder="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="input-label">Satuan</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="kg / pcs / m2"
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            />
                        </div>
                    </div>

                    {isEditModalOpen && (
                        <div>
                            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <span>Layanan Aktif</span>
                            </label>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
