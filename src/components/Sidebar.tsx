'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

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
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Styles for mobile sidebar
    const sidebarStyle: React.CSSProperties = isMobile ? {
        position: 'fixed',
        top: 0,
        left: isMobileMenuOpen ? 0 : -280,
        height: '100vh',
        width: 280,
        zIndex: 1000,
        transition: 'left 0.3s ease',
        boxShadow: isMobileMenuOpen ? '4px 0 20px rgba(0, 0, 0, 0.3)' : 'none',
    } : {};

    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
        backdropFilter: 'blur(4px)',
    };

    return (
        <>
            {/* Mobile Hamburger Button - Only show on mobile */}
            {isMobile && (
                <button
                    onClick={toggleMobileMenu}
                    aria-label="Toggle menu"
                    style={{
                        position: 'fixed',
                        top: 20,
                        left: 20,
                        zIndex: 1001,
                        width: 50,
                        height: 50,
                        borderRadius: 12,
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        fontSize: 24,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>
            )}

            {/* Overlay for mobile */}
            {isMobile && isMobileMenuOpen && (
                <div
                    style={overlayStyle}
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside className="sidebar" style={sidebarStyle}>
                <div className="sidebar-header" style={isMobile ? { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } : {}}>
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">🧺</div>
                        <span className="sidebar-logo-text">LaundryPro</span>
                    </div>
                    {/* Close button for mobile */}
                    {isMobile && (
                        <button
                            onClick={closeMobileMenu}
                            aria-label="Close menu"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--foreground)',
                                fontSize: 24,
                                cursor: 'pointer',
                                padding: 8,
                            }}
                        >
                            ✕
                        </button>
                    )}
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
