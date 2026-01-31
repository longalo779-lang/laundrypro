'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigation = [
    {
        title: 'Menu Utama',
        items: [
            { name: 'Dashboard', href: '/', icon: '📊' },
            { name: 'Point of Sale', href: '/pos', icon: '💳' },
        ],
    },
    {
        title: 'Manajemen',
        items: [
            { name: 'Order', href: '/orders', icon: '📦' },
            { name: 'Pelanggan', href: '/customers', icon: '👥' },
            { name: 'Inventaris', href: '/inventory', icon: '📋' },
            { name: 'Layanan', href: '/services', icon: '🏷️' },
        ],
    },
    {
        title: 'Laporan',
        items: [
            { name: 'Keuangan', href: '/reports', icon: '📈' },
        ],
    },
    {
        title: 'Konfigurasi',
        items: [
            { name: 'Pengaturan', href: '/settings', icon: '⚙️' },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                className="mobile-menu-toggle"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? '✕' : '☰'}
            </button>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'sidebar-mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">🧺</div>
                        <span className="sidebar-logo-text">LaundryPro</span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        className="sidebar-close-btn"
                        onClick={closeMobileMenu}
                        aria-label="Close menu"
                    >
                        ✕
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navigation.map((section) => (
                        <div key={section.title} className="nav-section">
                            <div className="nav-section-title">{section.title}</div>
                            {section.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`nav-item ${isActive ? 'active' : ''}`}
                                        onClick={closeMobileMenu}
                                    >
                                        <span className="nav-item-icon">{item.icon}</span>
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: 'var(--background-tertiary)',
                        borderRadius: '12px'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px'
                        }}>
                            👤
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>Admin</div>
                            <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)' }}>Administrator</div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
