'use client';

import { useState, useMemo, useEffect } from 'react';
import Modal from '@/components/Modal';
import { Service, Customer, OrderItem, Order } from '@/types';

interface CartItem extends OrderItem {
    service: Service;
}

export default function POSPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState({ name: '', phone: '', address: '' });
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'ewallet' | 'card'>('cash');
    const [cashReceived, setCashReceived] = useState('');
    const [orderNumber, setOrderNumber] = useState('');

    // New states for enhanced features
    const [orderNotes, setOrderNotes] = useState('');
    const [discountType, setDiscountType] = useState<'none' | 'percent' | 'amount'>('none');
    const [discountValue, setDiscountValue] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<'full' | 'dp' | 'later'>('full');
    const [dpAmount, setDpAmount] = useState('');
    const [heldOrders, setHeldOrders] = useState<{ customer: Customer | null; newCustomer: typeof newCustomerData; cart: CartItem[]; notes: string }[]>([]);
    const [showHeldOrders, setShowHeldOrders] = useState(false);
    const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [settings, setSettings] = useState<{ businessName: string; address?: string; phone?: string; email?: string; receiptFooter?: string } | null>(null);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [servicesRes, customersRes, settingsRes] = await Promise.all([
                    fetch('/api/services'),
                    fetch('/api/customers'),
                    fetch('/api/settings'),
                ]);

                const servicesData = await servicesRes.json();
                const customersData = await customersRes.json();
                const settingsData = await settingsRes.json();

                if (servicesData.success) {
                    setServices(servicesData.data);
                }
                if (customersData.success) {
                    setCustomers(customersData.data);
                }
                if (settingsData.success) {
                    setSettings(settingsData.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    };

    const categories = [
        { value: 'all', label: 'Semua', icon: '📦' },
        { value: 'regular', label: 'Reguler', icon: '👕' },
        { value: 'express', label: 'Express', icon: '⚡' },
        { value: 'premium', label: 'Premium', icon: '✨' },
        { value: 'specialty', label: 'Spesial', icon: '🎯' },
    ];

    const filteredServices = services.filter(service => {
        const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
        const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch && service.isActive;
    });

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.phone.includes(customerSearch)
    );

    const addToCart = (service: Service) => {
        const existingItem = cart.find(item => item.serviceId === service.id);
        if (existingItem) {
            if (service.unit === 'kg') {
                // For kg-based services, don't auto-increment, let user set weight
                return;
            }
            setCart(cart.map(item =>
                item.serviceId === service.id
                    ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.pricePerUnit }
                    : item
            ));
        } else {
            const newItem: CartItem = {
                id: String(Date.now()),
                serviceId: service.id,
                serviceName: service.name,
                quantity: 1,
                weight: service.unit === 'kg' ? 1 : undefined,
                pricePerUnit: service.price,
                subtotal: service.price,
                service,
            };
            setCart([...cart, newItem]);
        }
    };

    const updateCartItem = (itemId: string, quantity: number, weight?: number) => {
        if (quantity <= 0 && !weight) {
            setCart(cart.filter(item => item.id !== itemId));
        } else {
            setCart(cart.map(item => {
                if (item.id === itemId) {
                    const effectiveQuantity = item.service.unit === 'kg' ? (weight || 1) : quantity;
                    return {
                        ...item,
                        quantity: quantity > 0 ? quantity : 1,
                        weight: weight,
                        subtotal: effectiveQuantity * item.pricePerUnit,
                    };
                }
                return item;
            }));
        }
    };

    const removeFromCart = (itemId: string) => {
        setCart(cart.filter(item => item.id !== itemId));
    };

    // Calculate totals with discount
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

    const discountAmount = useMemo(() => {
        if (discountType === 'none' || !discountValue) return 0;
        if (discountType === 'percent') {
            const percent = parseFloat(discountValue);
            return Math.min((subtotal * percent) / 100, subtotal);
        }
        return Math.min(parseFloat(discountValue) || 0, subtotal);
    }, [discountType, discountValue, subtotal]);

    const cartTotal = subtotal - discountAmount;
    const totalWeight = cart.reduce((sum, item) => sum + (item.weight || 0), 0);

    // Calculate estimated completion date
    const estimatedDays = useMemo(() => {
        if (cart.length === 0) return 0;
        return Math.max(...cart.map(item => item.service.estimatedDays));
    }, [cart]);

    const estimatedCompletionDate = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() + estimatedDays);
        return date;
    }, [estimatedDays]);

    const handleCheckout = () => {
        if (cart.length === 0) return;
        if (!selectedCustomer && !isNewCustomer) return;
        if (isNewCustomer && (!newCustomerData.name || !newCustomerData.phone)) return;
        setIsCheckoutModalOpen(true);
    };

    const processPayment = async () => {
        setIsProcessing(true);
        try {
            // Create new customer if needed
            let customerId = selectedCustomer?.id;
            let customerName = selectedCustomer?.name || newCustomerData.name;
            let customerPhone = selectedCustomer?.phone || newCustomerData.phone;

            if (isNewCustomer) {
                const customerRes = await fetch('/api/customers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: newCustomerData.name,
                        phone: newCustomerData.phone,
                        address: newCustomerData.address || undefined,
                    }),
                });
                const customerData = await customerRes.json();
                if (customerData.success) {
                    customerId = customerData.data.id;
                    // Add to local customers list
                    setCustomers(prev => [...prev, customerData.data]);
                } else {
                    throw new Error(customerData.error || 'Gagal menambah pelanggan');
                }
            }

            // Calculate payment amount
            const paidAmount = paymentStatus === 'later' ? 0 : (paymentStatus === 'full' ? cartTotal : (parseInt(dpAmount) || 0));

            // Create order via API
            const orderRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId,
                    customerName,
                    customerPhone,
                    items: cart.map(item => ({
                        serviceId: item.serviceId,
                        serviceName: item.serviceName,
                        quantity: item.quantity,
                        weight: item.weight,
                        pricePerUnit: item.pricePerUnit,
                        subtotal: item.subtotal,
                    })),
                    totalWeight,
                    totalPrice: subtotal,
                    discountAmount,
                    paymentMethod: paymentStatus === 'later' ? 'Bayar Saat Ambil' : paymentMethod,
                    paymentStatus: paymentStatus === 'later' ? 'unpaid' : (paymentStatus === 'full' ? 'paid' : (paidAmount > 0 ? 'partial' : 'unpaid')),
                    paidAmount,
                    notes: orderNotes || undefined,
                    estimatedDays,
                }),
            });

            const orderData = await orderRes.json();
            if (orderData.success) {
                setOrderNumber(orderData.data.orderNumber);
                setCompletedOrder({
                    ...orderData.data,
                    estimatedCompletion: new Date(orderData.data.estimatedCompletion),
                    createdAt: new Date(orderData.data.createdAt),
                });
                setIsCheckoutModalOpen(false);
                setIsReceiptModalOpen(true);
            } else {
                throw new Error(orderData.error || 'Gagal membuat order');
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses pembayaran');
        } finally {
            setIsProcessing(false);
        }
    };

    const holdOrder = () => {
        if (cart.length === 0) return;
        setHeldOrders([...heldOrders, {
            customer: selectedCustomer,
            newCustomer: { ...newCustomerData },
            cart: [...cart],
            notes: orderNotes,
        }]);
        resetPOS(false);
    };

    const recallHeldOrder = (index: number) => {
        const held = heldOrders[index];
        setSelectedCustomer(held.customer);
        if (!held.customer && held.newCustomer.name) {
            setIsNewCustomer(true);
            setNewCustomerData(held.newCustomer);
        }
        setCart(held.cart);
        setOrderNotes(held.notes);
        setHeldOrders(heldOrders.filter((_, i) => i !== index));
        setShowHeldOrders(false);
    };

    const resetPOS = (closeReceipt = true) => {
        setCart([]);
        setSelectedCustomer(null);
        setIsNewCustomer(false);
        setNewCustomerData({ name: '', phone: '', address: '' });
        setCashReceived('');
        setPaymentMethod('cash');
        setOrderNotes('');
        setDiscountType('none');
        setDiscountValue('');
        setPaymentStatus('full');
        setDpAmount('');
        if (closeReceipt) {
            setIsReceiptModalOpen(false);
        }
        setOrderNumber('');
        setCompletedOrder(null);
    };

    const change = cashReceived ? parseInt(cashReceived) - (paymentStatus === 'full' ? cartTotal : parseInt(dpAmount) || 0) : 0;
    const amountToPay = paymentStatus === 'full' ? cartTotal : (parseInt(dpAmount) || 0);

    const quickAmounts = [10000, 20000, 50000, 100000, 150000, 200000];

    const sendWhatsAppNotification = () => {
        if (!completedOrder) return;
        const phone = completedOrder.customerPhone.replace(/^0/, '62');
        const message = encodeURIComponent(
            `Halo ${completedOrder.customerName}!\n\n` +
            `Terima kasih telah menggunakan LaundryPro.\n\n` +
            `📋 No. Order: ${completedOrder.orderNumber}\n` +
            `📅 Estimasi Selesai: ${formatDate(completedOrder.estimatedCompletion)}\n` +
            `💰 Total: ${formatCurrency(completedOrder.totalPrice)}\n` +
            `📍 Status: ${completedOrder.paymentStatus === 'paid' ? 'Lunas' : 'Belum Lunas'}\n\n` +
            `Kami akan menghubungi Anda saat cucian sudah siap diambil.\n\n` +
            `Terima kasih! 🧺`
        );
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
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
                    <h1 className="page-title">Point of Sale</h1>
                    <p className="page-subtitle">Buat order baru dan proses pembayaran</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {heldOrders.length > 0 && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowHeldOrders(true)}
                            style={{ position: 'relative' }}
                        >
                            📋 Order Tertunda
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: 'var(--danger)',
                                color: 'white',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                {heldOrders.length}
                            </span>
                        </button>
                    )}
                </div>
            </div>

            <div className="pos-container">
                {/* Left Side - Services */}
                <div className="pos-products">
                    {/* Customer Selection */}
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>👤 Pelanggan</h3>
                            {(selectedCustomer || isNewCustomer) && (
                                <button
                                    className="btn btn-secondary"
                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                    onClick={() => { setSelectedCustomer(null); setIsNewCustomer(false); setNewCustomerData({ name: '', phone: '', address: '' }); }}
                                >
                                    Ganti
                                </button>
                            )}
                        </div>

                        {!selectedCustomer && !isNewCustomer ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div className="search-box">
                                    <span className="search-box-icon">🔍</span>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Cari nama atau nomor telepon..."
                                        value={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                    />
                                </div>

                                {customerSearch && (
                                    <div style={{
                                        background: 'var(--background-tertiary)',
                                        borderRadius: '12px',
                                        maxHeight: '200px',
                                        overflowY: 'auto'
                                    }}>
                                        {filteredCustomers.map(customer => (
                                            <div
                                                key={customer.id}
                                                style={{
                                                    padding: '12px 16px',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid var(--border)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    transition: 'background 0.2s',
                                                }}
                                                onClick={() => {
                                                    setSelectedCustomer(customer);
                                                    setCustomerSearch('');
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'var(--background-secondary)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '8px',
                                                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: 'white'
                                                    }}>
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{customer.name}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>{customer.phone}</div>
                                                    </div>
                                                </div>
                                                <span className="badge badge-primary">{customer.totalOrders} order</span>
                                            </div>
                                        ))}
                                        {filteredCustomers.length === 0 && (
                                            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--foreground-secondary)' }}>
                                                Pelanggan tidak ditemukan
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setIsNewCustomer(true)}
                                    style={{ marginTop: '8px' }}
                                >
                                    ➕ Pelanggan Baru
                                </button>
                            </div>
                        ) : isNewCustomer ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Nama pelanggan *"
                                        value={newCustomerData.name}
                                        onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                                    />
                                    <input
                                        type="tel"
                                        className="input"
                                        placeholder="Nomor telepon *"
                                        value={newCustomerData.phone}
                                        onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                                    />
                                </div>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Alamat (opsional)"
                                    value={newCustomerData.address}
                                    onChange={(e) => setNewCustomerData({ ...newCustomerData, address: e.target.value })}
                                />
                                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>✅</span>
                                    <span style={{ fontSize: '13px' }}>Pelanggan baru akan disimpan otomatis saat checkout</span>
                                </div>
                            </div>
                        ) : selectedCustomer && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--background-tertiary)', padding: '12px', borderRadius: '12px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: 'white'
                                }}>
                                    {selectedCustomer.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', fontSize: '16px' }}>{selectedCustomer.name}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--foreground-secondary)' }}>📱 {selectedCustomer.phone}</div>
                                    {selectedCustomer.preferences && (
                                        <div style={{ fontSize: '12px', color: 'var(--warning)', marginTop: '4px' }}>⭐ {selectedCustomer.preferences}</div>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>Total Order</div>
                                    <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{selectedCustomer.totalOrders}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Category Filter */}
                    <div className="tabs" style={{ marginBottom: '20px' }}>
                        {categories.map(cat => (
                            <button
                                key={cat.value}
                                className={`tab ${selectedCategory === cat.value ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.value)}
                            >
                                {cat.icon} {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="search-box" style={{ marginBottom: '20px' }}>
                        <span className="search-box-icon">🔍</span>
                        <input
                            type="text"
                            className="input"
                            placeholder="Cari layanan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Services Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '12px'
                    }}>
                        {filteredServices.map(service => {
                            const isInCart = cart.some(item => item.serviceId === service.id);
                            return (
                                <div
                                    key={service.id}
                                    className="card"
                                    style={{
                                        cursor: 'pointer',
                                        padding: '14px',
                                        transition: 'all 0.2s ease',
                                        borderColor: isInCart ? 'var(--primary)' : undefined,
                                        background: isInCart ? 'rgba(99, 102, 241, 0.05)' : undefined,
                                    }}
                                    onClick={() => addToCart(service)}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '6px'
                                    }}>
                                        <h4 style={{ fontSize: '13px', fontWeight: '600' }}>{service.name}</h4>
                                        {isInCart && <span style={{ fontSize: '16px' }}>✓</span>}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                        <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '15px' }}>
                                            {formatCurrency(service.price)}
                                        </span>
                                        <span style={{ fontSize: '11px', color: 'var(--foreground-secondary)' }}>
                                            /{service.unit}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                        <span className={`badge badge-${service.category === 'express' ? 'warning' :
                                            service.category === 'premium' ? 'primary' :
                                                service.category === 'specialty' ? 'info' : 'success'
                                            }`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                                            {service.category}
                                        </span>
                                        <span style={{ fontSize: '10px', color: 'var(--foreground-secondary)' }}>
                                            ⏱️ {service.estimatedDays}h
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side - Cart */}
                <div className="pos-cart">
                    <div className="pos-cart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>🛒 Keranjang ({cart.length})</h3>
                        {cart.length > 0 && (
                            <button
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--danger)',
                                    cursor: 'pointer',
                                    fontSize: '13px'
                                }}
                                onClick={() => setCart([])}
                            >
                                Hapus Semua
                            </button>
                        )}
                    </div>

                    <div className="pos-cart-items">
                        {cart.length === 0 ? (
                            <div className="empty-state" style={{ padding: '40px 20px' }}>
                                <div className="empty-state-icon" style={{ fontSize: '40px', background: 'transparent' }}>🛒</div>
                                <div className="empty-state-title">Keranjang Kosong</div>
                                <div className="empty-state-text">Pilih layanan untuk ditambahkan</div>
                            </div>
                        ) : (
                            <>
                                {cart.map(item => (
                                    <div key={item.id} className="pos-cart-item">
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>
                                                {item.serviceName}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>
                                                {formatCurrency(item.pricePerUnit)} / {item.service.unit}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                                {item.service.unit === 'kg' ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <button
                                                            className="btn btn-icon btn-secondary"
                                                            style={{ width: '28px', height: '28px', fontSize: '12px' }}
                                                            onClick={() => updateCartItem(item.id, 1, Math.max(0.5, (item.weight || 1) - 0.5))}
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            type="number"
                                                            className="input"
                                                            style={{ width: '60px', padding: '4px 8px', fontSize: '14px', textAlign: 'center' }}
                                                            value={item.weight || 1}
                                                            min={0.5}
                                                            step={0.5}
                                                            onChange={(e) => updateCartItem(item.id, 1, parseFloat(e.target.value) || 0.5)}
                                                        />
                                                        <button
                                                            className="btn btn-icon btn-secondary"
                                                            style={{ width: '28px', height: '28px', fontSize: '12px' }}
                                                            onClick={() => updateCartItem(item.id, 1, (item.weight || 1) + 0.5)}
                                                        >
                                                            +
                                                        </button>
                                                        <span style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>kg</span>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <button
                                                            className="btn btn-icon btn-secondary"
                                                            style={{ width: '28px', height: '28px', fontSize: '12px' }}
                                                            onClick={() => updateCartItem(item.id, item.quantity - 1)}
                                                        >
                                                            -
                                                        </button>
                                                        <span style={{ width: '30px', textAlign: 'center', fontWeight: '600' }}>
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            className="btn btn-icon btn-secondary"
                                                            style={{ width: '28px', height: '28px', fontSize: '12px' }}
                                                            onClick={() => updateCartItem(item.id, item.quantity + 1)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                            <span style={{ fontWeight: '600' }}>{formatCurrency(item.subtotal)}</span>
                                            <button
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--danger)',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Notes */}
                                <div style={{ padding: '0 12px', marginTop: '12px' }}>
                                    <textarea
                                        className="input"
                                        placeholder="Catatan order (opsional)..."
                                        value={orderNotes}
                                        onChange={(e) => setOrderNotes(e.target.value)}
                                        rows={2}
                                        style={{ resize: 'none', fontSize: '13px' }}
                                    />
                                </div>

                                {/* Discount */}
                                <div style={{ padding: '12px', margin: '12px', background: 'var(--background-tertiary)', borderRadius: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '500' }}>🏷️ Diskon</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <select
                                            className="select"
                                            style={{ width: '100px', padding: '8px', fontSize: '12px' }}
                                            value={discountType}
                                            onChange={(e) => { setDiscountType(e.target.value as typeof discountType); setDiscountValue(''); }}
                                        >
                                            <option value="none">Tidak ada</option>
                                            <option value="percent">Persen (%)</option>
                                            <option value="amount">Nominal (Rp)</option>
                                        </select>
                                        {discountType !== 'none' && (
                                            <input
                                                type="number"
                                                className="input"
                                                style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                                                placeholder={discountType === 'percent' ? 'Contoh: 10' : 'Contoh: 5000'}
                                                value={discountValue}
                                                onChange={(e) => setDiscountValue(e.target.value)}
                                            />
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="pos-cart-footer">
                        {/* Estimation */}
                        {cart.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '10px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--foreground-secondary)' }}>📅 Estimasi Selesai</span>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>{formatDate(estimatedCompletionDate)}</span>
                            </div>
                        )}

                        {totalWeight > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--foreground-secondary)', fontSize: '13px' }}>Total Berat</span>
                                <span style={{ fontWeight: '500', fontSize: '13px' }}>{totalWeight} kg</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--foreground-secondary)', fontSize: '13px' }}>Subtotal</span>
                            <span style={{ fontWeight: '500', fontSize: '13px' }}>{formatCurrency(subtotal)}</span>
                        </div>

                        {discountAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--success)', fontSize: '13px' }}>Diskon</span>
                                <span style={{ fontWeight: '500', fontSize: '13px', color: 'var(--success)' }}>-{formatCurrency(discountAmount)}</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '18px', fontWeight: '600' }}>Total</span>
                            <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>
                                {formatCurrency(cartTotal)}
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            {cart.length > 0 && (
                                <button
                                    className="btn btn-secondary"
                                    style={{ padding: '14px' }}
                                    onClick={holdOrder}
                                    title="Tunda Order"
                                >
                                    ⏸️
                                </button>
                            )}
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '14px' }}
                                disabled={cart.length === 0 || (!selectedCustomer && (!isNewCustomer || !newCustomerData.name || !newCustomerData.phone))}
                                onClick={handleCheckout}
                            >
                                💳 Bayar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkout Modal */}
            <Modal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                title="💳 Pembayaran"
                size="md"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setIsCheckoutModalOpen(false)} disabled={isProcessing}>
                            Batal
                        </button>
                        <button
                            className="btn btn-success"
                            onClick={processPayment}
                            disabled={isProcessing || (paymentStatus !== 'later' && paymentMethod === 'cash' && (!cashReceived || parseInt(cashReceived) < amountToPay))}
                        >
                            {isProcessing ? '⏳ Memproses...' : `✅ Konfirmasi${paymentStatus !== 'later' ? ` (${formatCurrency(amountToPay)})` : ''}`}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Customer Info */}
                    <div style={{ background: 'var(--background-tertiary)', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>👤</span>
                        <div>
                            <div style={{ fontWeight: '600' }}>{selectedCustomer?.name || newCustomerData.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>{selectedCustomer?.phone || newCustomerData.phone}</div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div style={{ background: 'var(--background-tertiary)', padding: '16px', borderRadius: '12px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Ringkasan Order</h4>
                        {cart.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                                <span>{item.serviceName} {item.weight ? `(${item.weight}kg)` : `x${item.quantity}`}</span>
                                <span>{formatCurrency(item.subtotal)}</span>
                            </div>
                        ))}
                        {discountAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--success)' }}>
                                <span>Diskon</span>
                                <span>-{formatCurrency(discountAmount)}</span>
                            </div>
                        )}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: '600' }}>Total</span>
                            <span style={{ fontWeight: '700', fontSize: '18px', color: 'var(--primary)' }}>{formatCurrency(cartTotal)}</span>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div>
                        <label className="input-label">Status Pembayaran</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <button
                                className={`btn ${paymentStatus === 'full' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setPaymentStatus('full')}
                            >
                                💰 Bayar Penuh
                            </button>
                            <button
                                className={`btn ${paymentStatus === 'dp' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setPaymentStatus('dp')}
                            >
                                💵 DP / Sebagian
                            </button>
                            <button
                                className={`btn ${paymentStatus === 'later' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setPaymentStatus('later')}
                            >
                                ⏰ Bayar Saat Ambil
                            </button>
                        </div>
                        {paymentStatus === 'dp' && (
                            <div style={{ marginTop: '12px' }}>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="Jumlah DP"
                                    value={dpAmount}
                                    onChange={(e) => setDpAmount(e.target.value)}
                                />
                                {dpAmount && (
                                    <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--foreground-secondary)' }}>
                                        Sisa: {formatCurrency(cartTotal - (parseInt(dpAmount) || 0))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Payment Method - Only show if not "Bayar Saat Ambil" */}
                    {paymentStatus === 'later' ? (
                        <div style={{ background: 'rgba(255, 193, 7, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid var(--warning)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '24px' }}>⏰</span>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--warning)' }}>Pembayaran Ditunda</div>
                                    <div style={{ fontSize: '13px', color: 'var(--foreground-secondary)', marginTop: '4px' }}>
                                        Pelanggan akan membayar saat mengambil cucian yang sudah selesai.
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="input-label">Metode Pembayaran</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                {[
                                    { value: 'cash', label: '💵', name: 'Tunai' },
                                    { value: 'transfer', label: '🏦', name: 'Transfer' },
                                    { value: 'ewallet', label: '📱', name: 'E-Wallet' },
                                    { value: 'card', label: '💳', name: 'Kartu' },
                                ].map(method => (
                                    <button
                                        key={method.value}
                                        className={`btn ${paymentMethod === method.value ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{ flexDirection: 'column', padding: '12px 8px', fontSize: '12px' }}
                                        onClick={() => setPaymentMethod(method.value as typeof paymentMethod)}
                                    >
                                        <span style={{ fontSize: '20px' }}>{method.label}</span>
                                        <span>{method.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cash Input - Only show if paying now */}
                    {paymentStatus !== 'later' && paymentMethod === 'cash' && (
                        <div>
                            <label className="input-label">Uang Diterima</label>
                            <input
                                type="number"
                                className="input"
                                placeholder="Masukkan nominal"
                                value={cashReceived}
                                onChange={(e) => setCashReceived(e.target.value)}
                            />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                {quickAmounts.map(amount => (
                                    <button
                                        key={amount}
                                        className="btn btn-secondary"
                                        style={{ padding: '8px 12px', fontSize: '12px' }}
                                        onClick={() => setCashReceived(String(amount))}
                                    >
                                        {formatCurrency(amount)}
                                    </button>
                                ))}
                                <button
                                    className="btn btn-secondary"
                                    style={{ padding: '8px 12px', fontSize: '12px' }}
                                    onClick={() => setCashReceived(String(amountToPay))}
                                >
                                    Uang Pas
                                </button>
                            </div>
                            {cashReceived && parseInt(cashReceived) >= amountToPay && (
                                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Kembalian</span>
                                        <span style={{ fontWeight: '600', color: 'var(--success)', fontSize: '18px' }}>{formatCurrency(change)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Modal >

            {/* Receipt Modal */}
            < Modal
                isOpen={isReceiptModalOpen}
                onClose={() => resetPOS()}
                title="✅ Pembayaran Berhasil"
                size="md"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => resetPOS()}>
                            Order Baru
                        </button>
                        <button className="btn btn-success" onClick={sendWhatsAppNotification}>
                            📱 Kirim WA
                        </button>
                        <button className="btn btn-primary" onClick={() => window.print()}>
                            🖨️ Cetak
                        </button>
                    </>
                }
            >
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '40px'
                    }}>
                        ✅
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Transaksi Berhasil!</h3>
                    <p style={{ color: 'var(--foreground-secondary)' }}>{orderNumber}</p>
                </div>

                <div className="receipt-preview">
                    <div className="receipt-header">
                        <h4 style={{ fontSize: '18px', marginBottom: '4px' }}>🧺 {settings?.businessName || 'LaundryPro'}</h4>
                        {settings?.address && <p style={{ fontSize: '12px', marginBottom: '4px' }}>{settings.address}</p>}
                        {settings?.phone && <p style={{ fontSize: '12px', marginBottom: '4px' }}>Telp: {settings.phone}</p>}
                        {settings?.email && <p style={{ fontSize: '12px', marginBottom: '8px' }}>Email: {settings.email}</p>}
                        <p style={{ fontSize: '12px' }}>{new Date().toLocaleString('id-ID')}</p>
                    </div>

                    <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '12px', marginBottom: '12px' }}>
                        <p style={{ fontSize: '12px' }}>No: {orderNumber}</p>
                        <p style={{ fontSize: '12px' }}>Pelanggan: {completedOrder?.customerName}</p>
                        <p style={{ fontSize: '12px' }}>Telp: {completedOrder?.customerPhone}</p>
                    </div>

                    <div className="receipt-items">
                        {completedOrder?.items.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                                <span>{item.serviceName} {item.weight ? `(${item.weight}kg)` : `x${item.quantity}`}</span>
                                <span>{formatCurrency(item.subtotal)}</span>
                            </div>
                        ))}
                    </div>

                    {discountAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                            <span>Diskon</span>
                            <span>-{formatCurrency(discountAmount)}</span>
                        </div>
                    )}

                    <div className="receipt-total" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>TOTAL</span>
                        <span>{formatCurrency(completedOrder?.totalPrice || 0)}</span>
                    </div>

                    {paymentStatus !== 'later' && paymentMethod === 'cash' && cashReceived && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px' }}>
                                <span>Tunai</span>
                                <span>{formatCurrency(parseInt(cashReceived))}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                <span>Kembalian</span>
                                <span>{formatCurrency(change)}</span>
                            </div>
                        </>
                    )}

                    <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px', fontSize: '11px' }}>
                        <p style={{ fontWeight: '600', marginBottom: '4px' }}>📅 Estimasi Selesai:</p>
                        <p>{completedOrder ? formatDate(completedOrder.estimatedCompletion) : '-'}</p>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px' }}>
                        <p>{settings?.receiptFooter || 'Terima kasih atas kepercayaan Anda!'}</p>
                        <p>Simpan struk ini sebagai bukti pengambilan</p>
                    </div>
                </div>
            </Modal >

            {/* Held Orders Modal */}
            < Modal
                isOpen={showHeldOrders}
                onClose={() => setShowHeldOrders(false)}
                title="📋 Order Tertunda"
                size="md"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {heldOrders.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <div className="empty-state-title">Tidak ada order tertunda</div>
                        </div>
                    ) : (
                        heldOrders.map((held, index) => (
                            <div
                                key={index}
                                style={{
                                    background: 'var(--background-tertiary)',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: '600' }}>{held.customer?.name || held.newCustomer.name}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--foreground-secondary)' }}>
                                        {held.cart.length} item • {formatCurrency(held.cart.reduce((sum, i) => sum + i.subtotal, 0))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{ padding: '8px 16px', fontSize: '13px' }}
                                        onClick={() => recallHeldOrder(index)}
                                    >
                                        Lanjutkan
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        style={{ padding: '8px 12px', fontSize: '13px' }}
                                        onClick={() => setHeldOrders(heldOrders.filter((_, i) => i !== index))}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal >
        </div >
    );
}
