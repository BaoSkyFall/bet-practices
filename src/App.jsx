import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, theme } from 'antd';
import {
    HomeOutlined,
    DashboardOutlined,
    ThunderboltOutlined
} from '@ant-design/icons';
import BettingInterface from './components/BettingInterface';
import AdminDashboard from './components/AdminDashboard';

const { Header, Content, Footer } = Layout;

const AppContent = () => {
    const location = useLocation();

    const menuItems = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: <Link to="/">Betting</Link>
        },
        // {
        //     key: '/admin',
        //     icon: <DashboardOutlined />,
        //     label: <Link to="/admin">Dashboard</Link>
        // }
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
            <Header
                style={{
                    background: 'rgba(18, 18, 26, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid var(--border-color)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 24px'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginRight: '48px'
                }}>
                    <ThunderboltOutlined style={{
                        fontSize: '24px',
                        color: 'var(--accent-primary)',
                        marginRight: '8px'
                    }} />
                    <span style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        background: 'var(--gradient-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        BetTracker
                    </span>
                </div>

                <Menu
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{
                        flex: 1,
                        background: 'transparent',
                        borderBottom: 'none'
                    }}
                    theme="dark"
                />
            </Header>

            <Content style={{ padding: '24px', flex: 1 }}>
                <Routes>
                    <Route path="/" element={<BettingInterface />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
            </Content>

            <Footer
                style={{
                    textAlign: 'center',
                    background: 'transparent',
                    borderTop: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    padding: '16px'
                }}
            >
                <p style={{ margin: 0 }}>
                    ⚽ Betting Tracker © {new Date().getFullYear()} | For Educational Purposes Only
                </p>
            </Footer>
        </Layout>
    );
};

function App() {
    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#6366f1',
                    colorBgContainer: '#1a1a24',
                    colorBgElevated: '#22222e',
                    colorBorder: 'rgba(255, 255, 255, 0.1)',
                    colorText: '#ffffff',
                    colorTextSecondary: '#a1a1aa',
                    borderRadius: 12,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                },
                components: {
                    Menu: {
                        darkItemBg: 'transparent',
                        darkItemSelectedBg: 'rgba(99, 102, 241, 0.2)',
                        darkItemHoverBg: 'rgba(99, 102, 241, 0.1)'
                    },
                    Table: {
                        headerBg: '#12121a',
                        rowHoverBg: '#22222e'
                    }
                }
            }}
        >
            <Router>
                <AppContent />
            </Router>
        </ConfigProvider>
    );
}

export default App;
