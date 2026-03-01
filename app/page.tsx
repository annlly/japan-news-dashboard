'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3, Globe2, FileText, Search,
    Bell, User, TrendingUp, TrendingDown, Clock,
    Activity, Briefcase, Map, RefreshCw,
    Wifi, WifiOff, ChevronRight, Zap
} from 'lucide-react';

import { JapanNewsFeed } from '../components/JapanNewsFeed';
import { TrendingFeed } from '../components/TrendingFeed';

// ─── Fallback mock data when RSS fails ───────────────────────────────────────
const MOCK_NEWS = [
    { title: "日本経済産業省が対中半導体輸出規制を強化、先端HBMメモリも対象に", link: "#", pubDate: new Date(Date.now() - 3600000).toISOString(), source: "日経新聞", tag: "半导体" },
    { title: "Japan-China trade delegation resumes after 18-month hiatus amid tariff tensions", link: "#", pubDate: new Date(Date.now() - 7200000).toISOString(), source: "Nikkei Asia", tag: "中日经贸" },
    { title: "高市早苗、経済安保戦略でSBIR型ファンド設立を提言—対中技術封鎖の一環", link: "#", pubDate: new Date(Date.now() - 10800000).toISOString(), source: "読売新聞", tag: "政治安保" },
    { title: "TSMC Kumamoto fab Phase 2 confirmed: $20B investment reshapes Asia supply chain", link: "#", pubDate: new Date(Date.now() - 14400000).toISOString(), source: "Reuters", tag: "半导体" },
];

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('总览');
    const [newsList, setNewsList] = useState<any[]>([]);
    const [newsLoading, setNewsLoading] = useState(true);
    const [newsError, setNewsError] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

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

    const navItems = [
        { id: '总览', label: '总览 (Overview)', icon: <BarChart3 size={16} /> },
        { id: '政治安保', label: '地缘政治 (Geopolitics)', icon: <Globe2 size={16} /> },
        { id: '中日经贸', label: '经贸动态 (Economics)', icon: <Briefcase size={16} /> },
        { id: '半导体', label: '供应链追踪 (Supply Chain)', icon: <Map size={16} /> },
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
                    <div className="header-actions flex gap-3">
                        <div className="search-wrapper relative">
                            <Search size={15} className="search-icon absolute left-3 top-1/2 -translate-y-1/2" />
                            <input type="text" className="search-bar pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-full outline-none focus:border-[var(--accent)]" placeholder="搜索知识库或新闻..." />
                        </div>
                        <button className="icon-btn p-2 rounded-lg bg-white/5 hover:bg-white/10" onClick={fetchNews} title="刷新新闻">
                            <RefreshCw size={18} className={newsLoading ? 'spin' : ''} />
                        </button>
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
                        <div className="metric-label">全网舆情监控节点</div>
                        <div className="metric-value">11个</div>
                        <div className="metric-trend positive"><Activity size={13} /> 平台活跃正常</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-label">分析报告状态</div>
                        <div className="metric-value">0份</div>
                        <div className="metric-trend neutral"><Clock size={13} /> 今日待生成</div>
                    </div>
                </div>

                {/* News status banner */}
                {newsError && (
                    <div className="alert-banner my-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex gap-2 items-center">
                        <WifiOff size={15} />
                        <span>部分来源获取失败，显示最新缓存数据。</span>
                    </div>
                )}

                {/* Main Grid Component: Split into 3 columns or dynamic layout */}
                <div className="grid-main animate-in delay-1 mt-6">
                    {/* Column 1: Japan Google News */}
                    <JapanNewsFeed
                        activeTab={activeTab}
                        newsList={newsList}
                        loading={newsLoading}
                        error={newsError}
                    />

                    {/* Column 2: Chinese Trending Hub */}
                    <TrendingFeed />
                </div>
            </main>
        </div>
    );
}
