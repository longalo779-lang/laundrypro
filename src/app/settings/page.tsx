'use client';

import { useState, useEffect } from 'react';

interface SettingsData {
    id: string;
    businessName: string;
    address?: string;
    phone?: string;
    email?: string;
    receiptFooter?: string;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        businessName: '',
        address: '',
        phone: '',
        email: '',
        receiptFooter: '',
    });

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.success) {
                setSettings(data.data);
                setFormData({
                    businessName: data.data.businessName || '',
                    address: data.data.address || '',
                    phone: data.data.phone || '',
                    email: data.data.email || '',
                    receiptFooter: data.data.receiptFooter || '',
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (data.success) {
                setSettings(data.data);
                alert('✅ Pengaturan berhasil disimpan!');
            } else {
                alert(data.error || 'Gagal menyimpan pengaturan');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Terjadi kesalahan saat menyimpan pengaturan');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <p style={{ color: 'var(--foreground-secondary)' }}>Memuat pengaturan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Pengaturan Toko</h1>
                    <p className="page-subtitle">Atur informasi toko yang akan ditampilkan di struk</p>
                </div>
            </div>

            <div style={{ maxWidth: '800px' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Informasi Bisnis</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label className="input-label">Nama Bisnis *</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Contoh: LaundryPro"
                                value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            />
                            <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)', marginTop: '4px' }}>
                                Nama ini akan muncul di bagian atas struk
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Alamat</label>
                            <textarea
                                className="input"
                                placeholder="Contoh: Jl. Merdeka No. 123, Jakarta Pusat"
                                rows={3}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label className="input-label">Nomor Telepon</label>
                                <input
                                    type="tel"
                                    className="input"
                                    placeholder="Contoh: 08123456789"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="input-label">Email</label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="Contoh: info@laundrypro.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Pesan Footer Struk</label>
                            <textarea
                                className="input"
                                placeholder="Contoh: Terima kasih atas kepercayaan Anda!"
                                rows={3}
                                value={formData.receiptFooter}
                                onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                                style={{ resize: 'vertical' }}
                            />
                            <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)', marginTop: '4px' }}>
                                Pesan ini akan muncul di bagian bawah struk
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={fetchSettings}
                            disabled={saving}
                        >
                            Reset
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={!formData.businessName || saving}
                            style={{ flex: 1 }}
                        >
                            {saving ? '⏳ Menyimpan...' : '💾 Simpan Pengaturan'}
                        </button>
                    </div>
                </div>

                {/* Preview Struk */}
                <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Preview Struk</h2>

                    <div style={{
                        background: 'white',
                        color: 'black',
                        padding: '24px',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        maxWidth: '400px',
                        margin: '0 auto',
                        border: '1px dashed #ccc'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formData.businessName || 'Nama Toko'}</div>
                            {formData.address && <div style={{ fontSize: '11px', marginTop: '4px' }}>{formData.address}</div>}
                            {formData.phone && <div style={{ fontSize: '11px' }}>Telp: {formData.phone}</div>}
                            {formData.email && <div style={{ fontSize: '11px' }}>Email: {formData.email}</div>}
                        </div>

                        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '12px 0', margin: '12px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>No. Order:</span>
                                <span>ORD-20260201-001</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Tanggal:</span>
                                <span>01 Feb 2026</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Pelanggan:</span>
                                <span>Contoh Customer</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Cuci Express (3kg)</span>
                                <span>Rp 30.000</span>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px dashed #000', paddingTop: '8px', marginTop: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                <span>TOTAL:</span>
                                <span>Rp 30.000</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Bayar:</span>
                                <span>Rp 50.000</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Kembali:</span>
                                <span>Rp 20.000</span>
                            </div>
                        </div>

                        {formData.receiptFooter && (
                            <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #000', fontSize: '11px' }}>
                                {formData.receiptFooter}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
