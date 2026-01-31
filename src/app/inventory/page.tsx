'use client';

import { useState, useEffect, useMemo } from 'react';
import Modal from '@/components/Modal';

interface InventoryItemData {
    id: string;
    name: string;
    category: string;
    stock: number;
    unit: string;
    minStock: number;
    pricePerUnit: number;
    createdAt: string;
    updatedAt: string;
}

export default function InventoryPage() {
    const [inventory, setInventory] = useState<InventoryItemData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItemData | null>(null);
    const [restockAmount, setRestockAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: 'deterjen',
        stock: '',
        unit: '',
        minStock: '',
        pricePerUnit: '',
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const categories = [
        { value: 'all', label: 'Semua', icon: '📦' },
        { value: 'deterjen', label: 'Deterjen', icon: '🧴' },
        { value: 'pewangi', label: 'Pewangi', icon: '🌸' },
        { value: 'pemutih', label: 'Pemutih', icon: '✨' },
        { value: 'plastik', label: 'Plastik/Kemasan', icon: '📦' },
        { value: 'lainnya', label: 'Lainnya', icon: '🔧' },
    ];

    const getCategoryLabel = (category: string) => categories.find(c => c.value === category)?.label || category;
    const getCategoryIcon = (category: string) => categories.find(c => c.value === category)?.icon || '📦';

    // Fetch inventory from API
    const fetchInventory = async () => {
        try {
            const res = await fetch('/api/inventory');
            const data = await res.json();
            if (data.success) {
                setInventory(data.data);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const filteredInventory = useMemo(() => {
        return inventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [inventory, searchQuery, categoryFilter]);

    const stats = useMemo(() => {
        const lowStockItems = inventory.filter(item => item.stock <= item.minStock);
        const totalValue = inventory.reduce((sum, item) => sum + (item.stock * item.pricePerUnit), 0);
        return {
            totalItems: inventory.length,
            lowStockCount: lowStockItems.length,
            totalValue,
        };
    }, [inventory]);

    const handleAddItem = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    category: formData.category,
                    stock: parseInt(formData.stock) || 0,
                    unit: formData.unit,
                    minStock: parseInt(formData.minStock) || 0,
                    pricePerUnit: parseFloat(formData.pricePerUnit) || 0,
                }),
            });
            const data = await res.json();

            if (data.success) {
                setInventory([...inventory, data.data]);
                setFormData({ name: '', category: 'deterjen', stock: '', unit: '', minStock: '', pricePerUnit: '' });
                setIsAddModalOpen(false);
            } else {
                alert(data.error || 'Gagal menambah item');
            }
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Terjadi kesalahan saat menambah item');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRestock = async () => {
        if (!selectedItem || !restockAmount) return;
        setIsProcessing(true);
        try {
            const newStock = selectedItem.stock + parseInt(restockAmount);
            const res = await fetch(`/api/inventory/${selectedItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stock: newStock,
                    type: 'IN',
                    quantity: parseInt(restockAmount),
                    notes: 'Restock',
                }),
            });
            const data = await res.json();

            if (data.success) {
                setInventory(inventory.map(item =>
                    item.id === selectedItem.id ? { ...item, stock: newStock } : item
                ));
                setIsRestockModalOpen(false);
                setSelectedItem(null);
                setRestockAmount('');
            } else {
                alert(data.error || 'Gagal restock item');
            }
        } catch (error) {
            console.error('Error restocking:', error);
            alert('Terjadi kesalahan saat restock');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <p style={{ color: 'var(--foreground-secondary)' }}>Memuat data inventaris...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Manajemen Inventaris</h1>
                    <p className="page-subtitle">Pantau dan kelola stok bahan laundry</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={fetchInventory}>🔄 Refresh</button>
                    <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>➕ Tambah Item</button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalItems}</div>
                    <div style={{ fontSize: '14px', color: 'var(--foreground-secondary)' }}>Total Item</div>
                </div>
                <div className="card" style={{ padding: '16px', borderColor: stats.lowStockCount > 0 ? 'var(--warning)' : 'var(--border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: stats.lowStockCount > 0 ? 'var(--warning)' : 'var(--success)' }}>
                        {stats.lowStockCount}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--foreground-secondary)' }}>Stok Menipis</div>
                </div>
                <div className="card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(stats.totalValue)}</div>
                    <div style={{ fontSize: '14px', color: 'var(--foreground-secondary)' }}>Total Nilai Stok</div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div className="search-box" style={{ flex: 1, minWidth: '300px' }}>
                    <span className="search-box-icon">🔍</span>
                    <input type="text" className="input" placeholder="Cari item..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <select className="select" style={{ width: '200px' }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    {categories.map(cat => (<option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>))}
                </select>
            </div>

            {/* Inventory Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Kategori</th>
                            <th>Stok</th>
                            <th>Min.</th>
                            <th>Harga/Unit</th>
                            <th>Total Nilai</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInventory.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                                    <div className="empty-state">
                                        <div className="empty-state-icon">📦</div>
                                        <div className="empty-state-title">Tidak ada item</div>
                                        <div className="empty-state-text">Belum ada item inventaris</div>
                                        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                                            Tambah Item Pertama
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredInventory.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '24px' }}>{getCategoryIcon(item.category)}</span>
                                            <span style={{ fontWeight: '600' }}>{item.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-primary">{getCategoryLabel(item.category)}</span></td>
                                    <td>
                                        <span style={{ fontWeight: '600', color: item.stock <= item.minStock ? 'var(--warning)' : 'var(--foreground)' }}>
                                            {item.stock} {item.unit}
                                            {item.stock <= item.minStock && <span style={{ marginLeft: '8px' }}>⚠️</span>}
                                        </span>
                                    </td>
                                    <td>{item.minStock} {item.unit}</td>
                                    <td>{formatCurrency(item.pricePerUnit)}</td>
                                    <td style={{ fontWeight: '600' }}>{formatCurrency(item.stock * item.pricePerUnit)}</td>
                                    <td>
                                        <button
                                            className="btn btn-icon btn-success"
                                            onClick={() => { setSelectedItem(item); setIsRestockModalOpen(true); }}
                                            title="Restock"
                                        >
                                            ➕
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Item Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Tambah Item Baru"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)} disabled={isProcessing}>Batal</button>
                        <button className="btn btn-primary" onClick={handleAddItem} disabled={isProcessing || !formData.name || !formData.unit}>
                            {isProcessing ? '⏳ Menyimpan...' : 'Simpan'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label className="input-label">Nama Item *</label>
                        <input type="text" className="input" placeholder="Contoh: Deterjen Bubuk" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label className="input-label">Kategori</label>
                            <select className="select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                {categories.filter(c => c.value !== 'all').map(cat => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Satuan *</label>
                            <input type="text" className="input" placeholder="Contoh: kg, liter, pcs" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label className="input-label">Jumlah Awal</label>
                            <input type="number" className="input" placeholder="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Stok Minimum</label>
                            <input type="number" className="input" placeholder="0" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Harga/Unit (Rp)</label>
                        <input type="number" className="input" placeholder="0" value={formData.pricePerUnit} onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })} />
                    </div>
                </div>
            </Modal>

            {/* Restock Modal */}
            <Modal
                isOpen={isRestockModalOpen}
                onClose={() => { setIsRestockModalOpen(false); setSelectedItem(null); setRestockAmount(''); }}
                title="Restock Item"
                size="sm"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setIsRestockModalOpen(false)} disabled={isProcessing}>Batal</button>
                        <button className="btn btn-success" onClick={handleRestock} disabled={isProcessing || !restockAmount}>
                            {isProcessing ? '⏳ Memproses...' : 'Konfirmasi'}
                        </button>
                    </>
                }
            >
                {selectedItem && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ background: 'var(--background-tertiary)', padding: '16px', borderRadius: '12px' }}>
                            <div style={{ fontWeight: '600', fontSize: '16px' }}>{selectedItem.name}</div>
                            <div style={{ fontSize: '14px', color: 'var(--foreground-secondary)', marginTop: '4px' }}>
                                Stok saat ini: <strong>{selectedItem.stock} {selectedItem.unit}</strong>
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Jumlah Restock</label>
                            <input
                                type="number"
                                className="input"
                                placeholder="Masukkan jumlah"
                                value={restockAmount}
                                onChange={(e) => setRestockAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                        {restockAmount && (
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '14px', color: 'var(--foreground-secondary)' }}>Stok setelah restock:</div>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success)' }}>
                                    {selectedItem.stock + parseInt(restockAmount || '0')} {selectedItem.unit}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
