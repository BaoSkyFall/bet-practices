import React, { useState } from 'react';
import {
    Card,
    Row,
    Col,
    Typography,
    Input,
    InputNumber,
    Button,
    Space,
    Divider,
    Tag,
    message
} from 'antd';
import {
    TrophyOutlined,
    DollarOutlined,
    UserOutlined,
    ThunderboltOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

const { Title, Text } = Typography;

const BettingInterface = () => {
    // Flag component for cross-platform flag rendering (Windows doesn't support emoji flags)
    const Flag = ({ countryCode, size = 24, style = {} }) => (
        <img
            src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png 2x`}
            width={size}
            alt={countryCode}
            style={{ verticalAlign: 'middle', ...style }}
        />
    );

    // Match Details
    const matchDetails = {
        home: "Viet Nam",
        away: "China",
        homeFlag: <Flag countryCode="vn" size={24} />,
        awayFlag: <Flag countryCode="cn" size={24} />,
        league: "AFC U23 Asian Cup 2026",
        time: "22:30 - Jan 25, 2026",
        odds: {
            vietnam: 1.6,
            draw: 1.52,
            china: 2.31
        }
    };

    // State
    const [name, setName] = useState('');
    const [amount, setAmount] = useState(null);
    const [selection, setSelection] = useState(null);
    const [loading, setLoading] = useState(false);

    // Calculate potential win
    const currentRate = selection ? matchDetails.odds[selection] : 0;
    const potentialWin = amount && selection ? (amount * currentRate).toFixed(2) : '0.00';

    // Selection options
    const options = [
        {
            key: 'vietnam',
            label: matchDetails.home,
            flag: matchDetails.homeFlag,
            odds: matchDetails.odds.vietnam,
            color: '#ef4444'
        },
        {
            key: 'draw',
            label: 'Draw',
            flag: '🤝',
            odds: matchDetails.odds.draw,
            color: '#f59e0b'
        },
        {
            key: 'china',
            label: matchDetails.away,
            flag: matchDetails.awayFlag,
            odds: matchDetails.odds.china,
            color: '#ef4444'
        }
    ];

    // Handle bet submission (replaces existing bet if user already has one)
    const handleBet = async () => {
        if (!name.trim()) {
            message.error('Please enter your name');
            return;
        }
        if (!amount || amount <= 0) {
            message.error('Please enter a valid amount');
            return;
        }
        if (amount < 100000) {
            message.error('Minimum bet amount is 100,000 VND');
            return;
        }
        if (!selection) {
            message.error('Please select a betting option');
            return;
        }

        setLoading(true);
        try {
            // Check for existing bets by this user and delete them
            const existingBetsQuery = query(
                collection(db, "bets"),
                where("user_name", "==", name.trim()),
                where("match", "==", `${matchDetails.home} vs ${matchDetails.away}`)
            );
            const existingBetsSnapshot = await getDocs(existingBetsQuery);

            const deletePromises = existingBetsSnapshot.docs.map((betDoc) =>
                deleteDoc(doc(db, "bets", betDoc.id))
            );
            await Promise.all(deletePromises);

            const hadExistingBet = existingBetsSnapshot.size > 0;

            // Add new bet
            await addDoc(collection(db, "bets"), {
                user_name: name.trim(),
                bet_amount: amount,
                selected_team: selection,
                odds_at_time: currentRate,
                potential_win: parseFloat(potentialWin),
                timestamp: serverTimestamp(),
                match: `${matchDetails.home} vs ${matchDetails.away}`
            });

            if (hadExistingBet) {
                message.success('🔄 Your bet has been updated!');
            } else {
                message.success('🎉 Bet placed successfully!');
            }
            // Reset form
            setName('');
            setAmount(null);
            setSelection(null);
        } catch (error) {
            console.error("Error adding document: ", error);
            message.error('Failed to place bet. Please check your connection.');
        }
        setLoading(false);
    };

    const cardStyle = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        height: '100%'
    };

    const selectedCardStyle = {
        ...cardStyle,
        border: '2px solid var(--accent-primary)',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        boxShadow: 'var(--shadow-glow)'
    };

    return (
        <div className="fade-in-up" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            {/* Match Header */}
            <Card
                style={{
                    ...cardStyle,
                    marginBottom: '24px',
                    background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)'
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <Tag color="purple" style={{ marginBottom: '12px' }}>
                        <TrophyOutlined /> {matchDetails.league}
                    </Tag>
                    <Title level={2} style={{ color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                        {matchDetails.homeFlag} {matchDetails.home} vs {matchDetails.away} {matchDetails.awayFlag}
                    </Title>
                    <Text style={{ color: 'var(--text-secondary)' }}>
                        ⏰ {matchDetails.time}
                    </Text>
                </div>
            </Card>

            {/* Odds Selection */}
            <Title level={4} style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>
                <ThunderboltOutlined style={{ color: 'var(--accent-primary)' }} /> Select Your Prediction
            </Title>

            <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
                {options.map((option) => (
                    <Col xs={8} sm={8} key={option.key}>
                        <Card
                            hoverable
                            style={selection === option.key ? selectedCardStyle : cardStyle}
                            onClick={() => setSelection(option.key)}
                            bodyStyle={{ textAlign: 'center', padding: '24px' }}
                        >
                            {selection === option.key && (
                                <CheckCircleOutlined
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        color: 'var(--accent-success)',
                                        fontSize: '20px'
                                    }}
                                />
                            )}
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                                {option.flag}
                            </div>
                            <Title level={4} style={{ color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                                {option.label}
                            </Title>
                            <div
                                style={{
                                    background: 'var(--gradient-gold)',
                                    borderRadius: '8px',
                                    padding: '2px 8px',
                                    display: 'inline-block'
                                }}
                            >
                                <Text strong style={{ color: '#000', fontSize: '18px' }}>
                                    {option.odds.toFixed(2)}
                                </Text>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Betting Form */}
            <Card style={{ ...cardStyle, marginBottom: '24px' }}>
                <Title level={4} style={{ color: 'var(--text-primary)', marginBottom: '24px' }}>
                    <DollarOutlined style={{ color: 'var(--accent-success)' }} /> Place Your Bet
                </Title>

                <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                            <Text style={{ color: 'var(--text-secondary)' }}>
                                <UserOutlined /> Your ID
                            </Text>
                            <Input
                                size="large"
                                placeholder="Enter your ID, for example: baoppq"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ borderRadius: '12px' }}
                            />
                        </Space>
                    </Col>
                    <Col xs={24} md={12}>
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                            <Text style={{ color: 'var(--text-secondary)' }}>
                                <DollarOutlined /> Bet Amount (VND)
                            </Text>
                            <InputNumber
                                size="large"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(value) => setAmount(value)}
                                min={0}
                                style={{ width: '100%', borderRadius: '12px' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/(,*)/g, '')}
                            />
                        </Space>
                    </Col>
                </Row>

                <Divider style={{ borderColor: 'var(--border-color)' }} />

                {/* Summary */}
                <div
                    style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '24px'
                    }}
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                            <Text style={{ color: 'var(--text-secondary)', display: 'block' }}>Selection</Text>
                            <Text strong style={{ color: 'var(--text-primary)', fontSize: '18px' }}>
                                {selection ? options.find(o => o.key === selection)?.label : '—'}
                            </Text>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Text style={{ color: 'var(--text-secondary)', display: 'block' }}>Odds</Text>
                            <Text strong style={{ color: 'var(--accent-warning)', fontSize: '18px' }}>
                                {currentRate ? currentRate.toFixed(2) : '—'}
                            </Text>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Text style={{ color: 'var(--text-secondary)', display: 'block' }}>Potential Return</Text>
                            <Text strong style={{ color: 'var(--accent-success)', fontSize: '24px' }}>
                                {Number(potentialWin).toLocaleString()} VND
                            </Text>
                        </Col>
                    </Row>
                </div>

                <Button
                    type="primary"
                    size="large"
                    block
                    loading={loading}
                    onClick={handleBet}
                    disabled={!selection || !name || !amount}
                    icon={<ThunderboltOutlined />}
                >
                    {loading ? 'Placing Bet...' : 'Confirm Bet'}
                </Button>
            </Card>
        </div>
    );
};

export default BettingInterface;
