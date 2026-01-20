import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Statistic,
    Row,
    Col,
    Typography,
    Tag,
    Space,
    Spin,
    Empty
} from 'antd';
import {
    DollarOutlined,
    TeamOutlined,
    TrophyOutlined,
    RiseOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const { Title, Text } = Typography;

const AdminDashboard = () => {
    // Flag component for cross-platform flag rendering (Windows doesn't support emoji flags)
    const Flag = ({ countryCode, size = 16, style = {} }) => (
        <img
            src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png 2x`}
            width={size}
            alt={countryCode}
            style={{ verticalAlign: 'middle', ...style }}
        />
    );

    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "bets"), orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const betsData = [];
            querySnapshot.forEach((doc) => {
                betsData.push({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate?.()?.toLocaleString() || 'Pending'
                });
            });
            setBets(betsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching bets:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Calculate statistics
    const totalPool = bets.reduce((sum, bet) => sum + (bet.bet_amount || 0), 0);
    const totalBets = bets.length;
    const avgBet = totalBets > 0 ? (totalPool / totalBets).toFixed(2) : 0;

    // Count by selection
    const selectionCounts = bets.reduce((acc, bet) => {
        acc[bet.selected_team] = (acc[bet.selected_team] || 0) + 1;
        return acc;
    }, {});

    const columns = [
        {
            title: 'User',
            dataIndex: 'user_name',
            key: 'user_name',
            render: (name) => (
                <Space>
                    <TeamOutlined style={{ color: 'var(--accent-primary)' }} />
                    <Text strong style={{ color: 'var(--text-primary)' }}>{name}</Text>
                </Space>
            )
        },
        {
            title: 'Selection',
            dataIndex: 'selected_team',
            key: 'selected_team',
            render: (team) => {
                const colors = {
                    vietnam: 'red',
                    draw: 'gold',
                    china: 'red'
                };
                const labels = {
                    vietnam: <><Flag countryCode="vn" /> Vietnam</>,
                    draw: '🤝 Draw',
                    china: <><Flag countryCode="cn" /> China</>
                };
                return (
                    <Tag color={colors[team] || 'default'}>
                        {labels[team] || team}
                    </Tag>
                );
            },
            filters: [
                { text: 'Vietnam', value: 'vietnam' },
                { text: 'Draw', value: 'draw' },
                { text: 'China', value: 'china' }
            ],
            onFilter: (value, record) => record.selected_team === value
        },
        {
            title: 'Bet Amount',
            dataIndex: 'bet_amount',
            key: 'bet_amount',
            render: (amount) => (
                <Text style={{ color: 'var(--accent-warning)', fontWeight: 600 }}>
                    ${amount?.toLocaleString() || 0}
                </Text>
            ),
            sorter: (a, b) => a.bet_amount - b.bet_amount
        },
        {
            title: 'Odds',
            dataIndex: 'odds_at_time',
            key: 'odds_at_time',
            render: (odds) => (
                <Tag color="purple">{odds?.toFixed(2) || '—'}</Tag>
            )
        },
        {
            title: 'Potential Win',
            dataIndex: 'potential_win',
            key: 'potential_win',
            render: (win) => (
                <Text style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                    ${win?.toLocaleString() || 0}
                </Text>
            ),
            sorter: (a, b) => a.potential_win - b.potential_win
        },
        {
            title: 'Time',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (time) => (
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {time}
                </Text>
            )
        }
    ];

    const cardStyle = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px'
    };

    const statCardStyle = {
        ...cardStyle,
        textAlign: 'center',
        padding: '8px'
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="fade-in-up" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <Title level={2} style={{ color: 'var(--text-primary)', marginBottom: '24px' }}>
                <BarChartOutlined style={{ color: 'var(--accent-primary)' }} /> Dashboard
            </Title>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={statCardStyle} hoverable>
                        <Statistic
                            title={<Text style={{ color: 'var(--text-secondary)' }}>Total Pool</Text>}
                            value={totalPool}
                            precision={2}
                            prefix={<DollarOutlined style={{ color: 'var(--accent-success)' }} />}
                            valueStyle={{ color: 'var(--accent-success)', fontWeight: 700 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={statCardStyle} hoverable>
                        <Statistic
                            title={<Text style={{ color: 'var(--text-secondary)' }}>Total Bets</Text>}
                            value={totalBets}
                            prefix={<TeamOutlined style={{ color: 'var(--accent-primary)' }} />}
                            valueStyle={{ color: 'var(--accent-primary)', fontWeight: 700 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={statCardStyle} hoverable>
                        <Statistic
                            title={<Text style={{ color: 'var(--text-secondary)' }}>Average Bet</Text>}
                            value={avgBet}
                            precision={2}
                            prefix={<RiseOutlined style={{ color: 'var(--accent-warning)' }} />}
                            valueStyle={{ color: 'var(--accent-warning)', fontWeight: 700 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={statCardStyle} hoverable>
                        <Statistic
                            title={<Text style={{ color: 'var(--text-secondary)' }}>Most Popular</Text>}
                            value={
                                Object.keys(selectionCounts).length > 0
                                    ? Object.entries(selectionCounts).sort((a, b) => b[1] - a[1])[0]?.[0]?.toUpperCase() || '—'
                                    : '—'
                            }
                            prefix={<TrophyOutlined style={{ color: '#f59e0b' }} />}
                            valueStyle={{ color: '#f59e0b', fontWeight: 700, fontSize: '20px' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Betting Distribution */}
            <Card style={{ ...cardStyle, marginBottom: '24px' }}>
                <Title level={4} style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>
                    Betting Distribution
                </Title>
                <Row gutter={[16, 16]}>
                    {['vietnam', 'draw', 'china'].map((team) => {
                        const count = selectionCounts[team] || 0;
                        const percentage = totalBets > 0 ? ((count / totalBets) * 100).toFixed(1) : 0;
                        const labels = {
                            vietnam: <><Flag countryCode="vn" size={20} /> Vietnam</>,
                            draw: '🤝 Draw',
                            china: <><Flag countryCode="cn" size={20} /> China</>
                        };
                        const colors = {
                            vietnam: 'var(--accent-danger)',
                            draw: 'var(--accent-warning)',
                            china: 'var(--accent-danger)'
                        };
                        return (
                            <Col xs={24} sm={8} key={team}>
                                <div style={{
                                    background: 'var(--bg-secondary)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    textAlign: 'center'
                                }}>
                                    <Text style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                                        {labels[team]}
                                    </Text>
                                    <div style={{
                                        fontSize: '32px',
                                        fontWeight: 700,
                                        color: colors[team]
                                    }}>
                                        {count}
                                    </div>
                                    <Text style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                        ({percentage}%)
                                    </Text>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </Card>

            {/* Bets Table */}
            <Card style={cardStyle}>
                <Title level={4} style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>
                    All Bets
                </Title>
                {bets.length > 0 ? (
                    <Table
                        dataSource={bets}
                        columns={columns}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 800 }}
                        style={{ background: 'transparent' }}
                    />
                ) : (
                    <Empty
                        description={
                            <Text style={{ color: 'var(--text-secondary)' }}>
                                No bets placed yet
                            </Text>
                        }
                    />
                )}
            </Card>
        </div>
    );
};

export default AdminDashboard;
