'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    BarChart3, Globe2, FileText, Send, Search,
    Bell, User, TrendingUp, TrendingDown, Clock,
    Activity, Briefcase, Map, RefreshCw, ExternalLink,
    AlertTriangle, Wifi, WifiOff, ChevronRight, Zap
} from 'lucide-react';

// ─── Fallback mock data when RSS fails ───────────────────────────────────────
const MOCK_NEWS = [
    { title: "日本経済産業省が対中半導体輸出規制を強化、先端HBMメモリも対象に", link: "#", pubDate: new Date(Date.now() - 3600000).toISOString(), source: "日経新聞", tag: "半导体" },
    { title: "Japan-China trade delegation resumes after 18-month hiatus amid tariff tensions", link: "#", pubDate: new Date(Date.now() - 7200000).toISOString(), source: "Nikkei Asia", tag: "中日经贸" },
    { title: "高市早苗、経済安保戦略でSBIR型ファンド設立を提言—対中技術封鎖の一環", link: "#", pubDate: new Date(Date.now() - 10800000).toISOString(), source: "読売新聞", tag: "政治安保" },
    { title: "TSMC Kumamoto fab Phase 2 confirmed: $20B investment reshapes Asia supply chain", link: "#", pubDate: new Date(Date.now() - 14400000).toISOString(), source: "Reuters", tag: "半导体" },
    { title: "中日两国重启部长级经贸磋商，稀土出口管制为核心议题", link: "#", pubDate: new Date(Date.now() - 18000000).toISOString(), source: "财新", tag: "中日经贸" },
    { title: "CSIS Report: Japan's Indo-Pacific Economic Framework role expanding under new security doctrine", link: "#", pubDate: new Date(Date.now() - 21600000).toISOString(), source: "CSIS", tag: "政治安保" },
    { title: "三菱UFJリサーチ：対中直接投資が3年ぶり反発、製造業回帰の兆候", link: "#", pubDate: new Date(Date.now() - 25200000).toISOString(), source: "MURC", tag: "中日经贸" },
    { title: "Japan's RIETI study: Supply chain decoupling adds 12% cost premium to electronics manufacturers", link: "#", pubDate: new Date(Date.now() - 28800000).toISOString(), source: "RIETI", tag: "半导体" },
];

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
    tag: string;
}

interface ChatMsg { role: 'ai' | 'user'; text: string; }

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
    '半导体': { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa' },
    '政治安保': { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
    '中日经贸': { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
};

function TimeAgo({ dateStr }: { dateStr: string }) {
    if (!dateStr) return <span>未知时间</span>;
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return <span>{mins} 分钟前</span>;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return <span>{hrs} 小时前</span>;
    return <span>{Math.floor(hrs / 24)} 天前</span>;
}

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('总览');
    const [newsList, setNewsList] = useState<NewsItem[]>([]);
    const [newsLoading, setNewsLoading] = useState(true);
    const [newsError, setNewsError] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMsg[]>([
        { role: 'ai', text: '知识库已连接。当前加载主题：高市早苗政权下的日本战略转型、中日经贸关系演变、亚洲供应链角色重塑。您想查询什么内容？' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const fetchNews = async () => {
        setNewsLoading(true);
        setNewsError(false);
        try {
            const res = await fetch('/api/news');
            const data = await res.json();
            if (data.news && data.news.length > 0) {
                setNewsList(data.news);
            } else {
                setNewsList(MOCK_NEWS);
                setNewsError(true);
            }
        } catch {
            setNewsList(MOCK_NEWS);
            setNewsError(true);
        } finally {
            setNewsLoading(false);
            setLastRefresh(new Date());
        }
    };

    useEffect(() => { fetchNews(); }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isLoading]);

    const handleChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        const question = chatInput;
        setChatHistory(h => [...h, { role: 'user', text: question }]);
        setChatInput('');
        setIsLoading(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
            });
            const data = await res.json();
            setChatHistory(h => [...h, { role: 'ai', text: data.answer || data.error || '无法解析响应' }]);
        } catch {
            setChatHistory(h => [...h, { role: 'ai', text: '⚠️ 暂时无法连接 NotebookLM。请确保本地代理 node mcp-proxy.mjs 正在运行。' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredNews = activeTab === '总览' || activeTab === '定时报告'
        ? newsList
        : newsList.filter(n => n.tag === activeTab ||
            (activeTab === '政治安保' && n.tag === '政治安保') ||
            (activeTab === '中日经贸' && n.tag === '中日经贸') ||
            (activeTab === '半导体' && n.tag === '半导体'));

    const navItems = [
        { id: '总览', label: '总览 (Overview)', icon: <BarChart3 size={16} /> },
        { id: '政治安保', label: '地缘政治 (Geopolitics)', icon: <Globe2 size={16} /> },
        { id: '中日经贸', label: '经贸动态 (Economics)', icon: <Briefcase size={16} /> },
        { id: '半导体', label: '供应链追踪 (Supply Chain)', icon: <Map size={16} /> },
        { id: '定时报告', label: '定时报告 (Reports)', icon: <FileText size={16} /> },
    ];

    return (
        <div className="dashboard-container">
            {/* ── Sidebar ── */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-dot" />
                    <h1>J-CN Intel Hub</h1>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <a key={item.id} href="#"
                            onClick={e => { e.preventDefault(); setActiveTab(item.id); }}
                            className={`nav-link${activeTab === item.id ? ' active' : ''}`}>
                            {item.icon}
                            <span>{item.label}</span>
                            {activeTab === item.id && <ChevronRight size={14} className="nav-arrow" />}
                        </a>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <div className="status-dot online" />
                    <span>实时监控中</span>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="main-content">
                {/* Header */}
                <header className="header">
                    <div>
                        <h2 className="header-title">实时大盘 / 政治经济动态</h2>
                        <p className="header-sub">
                            {lastRefresh
                                ? `上次更新：${lastRefresh.toLocaleTimeString('zh-CN')}`
                                : '正在加载...'}
                        </p>
                    </div>
                    <div className="header-actions">
                        <div className="search-wrapper">
                            <Search size={15} className="search-icon" />
                            <input type="text" className="search-bar" placeholder="搜索知识库或新闻..." />
                        </div>
                        <button className="icon-btn" onClick={fetchNews} title="刷新新闻">
                            <RefreshCw size={18} className={newsLoading ? 'spin' : ''} />
                        </button>
                        <button className="icon-btn"><Bell size={18} /></button>
                        <button className="icon-btn"><User size={18} /></button>
                    </div>
                </header>

                {/* Metrics */}
                <div className="grid-metrics animate-in">
                    <div className="metric-card">
                        <div className="metric-label">日元汇率 (USD/JPY)</div>
                        <div className="metric-value">150.45</div>
                        <div className="metric-trend positive"><TrendingUp size={13} /> +0.2% 较上周</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-label">东证指数 (TOPIX)</div>
                        <div className="metric-value">2,750.12</div>
                        <div className="metric-trend negative"><TrendingDown size={13} /> -1.1% 较昨日</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-label">中日贸易额 (月度)</div>
                        <div className="metric-value">$248 亿</div>
                        <div className="metric-trend neutral"><Clock size={13} /> 2 天前更新</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-label">风险事件预警</div>
                        <div className="metric-value alert">3 起</div>
                        <div className="metric-trend danger"><Activity size={13} /> 需高优关注</div>
                    </div>
                </div>

                {/* News status banner */}
                {newsError && (
                    <div className="alert-banner">
                        <WifiOff size={15} />
                        <span>RSS 源暂时受限，显示最新缓存数据。</span>
                        <button onClick={fetchNews} className="retry-btn">重试 <RefreshCw size={12} /></button>
                    </div>
                )}
                {!newsError && !newsLoading && (
                    <div className="success-banner">
                        <Wifi size={15} />
                        <span>实时数据已加载，共 {newsList.length} 条情报。</span>
                    </div>
                )}

                {/* Main Grid */}
                <div className="grid-main animate-in delay-1">
                    {/* News Feed */}
                    <div className="glass-card news-card">
                        <div className="card-header">
                            <h3>
                                <Zap size={16} className="card-icon" />
                                {activeTab === '总览' ? '日本政经·涉华核心事件追踪' : `${activeTab} — 专属情报流`}
                            </h3>
                            <div className="live-badge">
                                <span className="live-dot" />LIVE
                            </div>
                        </div>

                        <div className="news-list">
                            {newsLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="news-skeleton">
                                        <div className="skel skel-tag" />
                                        <div className="skel skel-title" />
                                        <div className="skel skel-meta" />
                                    </div>
                                ))
                            ) : filteredNews.slice(0, 8).map((news, idx) => {
                                const tagStyle = TAG_COLORS[news.tag] || { bg: 'rgba(100,100,100,0.15)', color: '#aaa' };
                                return (
                                    <div className="news-item" key={idx}>
                                        <div className="news-tags">
                                            <span className="news-tag" style={{ background: tagStyle.bg, color: tagStyle.color }}>
                                                {news.tag}
                                            </span>
                                            <span className="news-source">{news.source}</span>
                                        </div>
                                        <a href={news.link} target="_blank" rel="noreferrer" className="news-title">
                                            {news.title}
                                            <ExternalLink size={11} className="ext-icon" />
                                        </a>
                                        <div className="news-meta">
                                            <Clock size={11} />
                                            <TimeAgo dateStr={news.pubDate} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* NotebookLM Chat */}
                    <div className="glass-card chat-card">
                        <div className="card-header">
                            <h3>NotebookLM 知识库助手</h3>
                            <span className="online-badge">● 在线</span>
                        </div>
                        <div className="chat-body">
                            <div className="chat-history">
                                {chatHistory.map((msg, idx) => (
                                    <div key={idx} className={`bubble ${msg.role}`}>{msg.text}</div>
                                ))}
                                {isLoading && (
                                    <div className="bubble ai loading-bubble">
                                        <span className="dot" /><span className="dot" /><span className="dot" />
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>
                            <form onSubmit={handleChat} className="chat-form">
                                <input
                                    type="text"
                                    className="chat-input"
                                    placeholder="向研究笔记提问..."
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button type="submit" className="send-btn" disabled={isLoading}>
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Reports Section */}
                <ReportsSection />
            </main>
        </div>
    );
}

function ReportsSection() {
    const [reports, setReports] = useState<any[]>([]);
    useEffect(() => {
        fetch('/api/reports').then(r => r.json()).then(d => setReports(d.reports || [])).catch(() => { });
    }, []);

    return (
        <div className="glass-card reports-card animate-in delay-2">
            <div className="card-header">
                <h3><FileText size={16} className="card-icon" /> 定时分析报告 (Automated Reports)</h3>
                <a href="#" className="view-all-btn">生成新报告 →</a>
            </div>
            {reports.length === 0 ? (
                <div className="empty-state">
                    <AlertTriangle size={32} className="empty-icon" />
                    <p>暂无生成的报告</p>
                    <span>在终端执行 <code>node scripts/generate_report.mjs</code> 生成分析报告</span>
                </div>
            ) : (
                <div className="reports-grid">
                    {reports.map((r, i) => (
                        <div key={i} className="report-card">
                            <FileText size={22} className="report-icon" />
                            <div className="report-name">{r.filename.replace('.md', '')}</div>
                            <div className="report-meta">
                                {(r.size / 1024).toFixed(1)} KB · {new Date(r.date).toLocaleDateString('zh-CN')}
                            </div>
                            <a href={`/api/reports/download/${r.filename}`} className="dl-btn">下载 Markdown</a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
