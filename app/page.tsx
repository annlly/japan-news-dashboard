'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Map,
    Globe2,
    FileText,
    Send,
    Search,
    Bell,
    User,
    TrendingUp,
    Clock,
    Activity,
    Briefcase
} from 'lucide-react';

export default function Dashboard() {
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'ai', text: '知识库已连接。目前加载的主题：高市早苗政权下的日本战略转型、中日经贸关系演变、亚洲供应链角色重塑。您想查询什么内容？' }
    ]);
    const [activeTab, setActiveTab] = useState('总览');
    const [newsList, setNewsList] = useState<any[]>([]);
    const [reportsList, setReportsList] = useState<any[]>([]);
    const mcpUrl = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_MCP_URL || 'http://localhost:4000') : 'http://localhost:4000';

    useEffect(() => {
        // Fetch real news
        fetch(`${mcpUrl}/api/news`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } })
            .then(res => res.json())
            .then(data => {
                if (data.news) setNewsList(data.news);
            })
            .catch(console.error);

        // Fetch real reports
        fetch(`${mcpUrl}/api/reports`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } })
            .then(res => res.json())
            .then(data => {
                if (data.reports) setReportsList(data.reports);
            })
            .catch(console.error);
    }, [mcpUrl]);

    const handleChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        // Add user message
        const newHistory = [...chatHistory, { role: 'user', text: chatInput }];
        setChatHistory(newHistory);
        setChatInput('');

        try {
            const mcpUrl = process.env.NEXT_PUBLIC_MCP_URL || 'http://localhost:4000';
            const response = await fetch(`${mcpUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Bypass-Tunnel-Reminder': 'true'
                },
                body: JSON.stringify({
                    question: chatInput,
                    notebook_id: 'japan-news-intel-hub'
                })
            });
            const data = await response.json();

            setChatHistory([
                ...newHistory,
                { role: 'ai', text: data?.answer || data?.error || '无法解析 NotebookLM 响应' }
            ]);
        } catch (err: any) {
            setChatHistory([
                ...newHistory,
                { role: 'ai', text: "❌ 暂时无法连接到你的本地知识库。请确保已在终端运行了 `node mcp-proxy.mjs`，并在 Vercel 配置了环境变量。" }
            ]);
        }
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1><span></span> J-CN Intel Hub</h1>
                </div>
                <nav>
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('总览'); }} className={`nav-link ${activeTab === '总览' ? 'active' : ''}`}><BarChart3 size={18} /> 总览 (Overview)</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('政治安保'); }} className={`nav-link ${activeTab === '政治安保' ? 'active' : ''}`}><Globe2 size={18} /> 地缘政治 (Geopolitics)</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('中日经贸'); }} className={`nav-link ${activeTab === '中日经贸' ? 'active' : ''}`}><Briefcase size={18} /> 经贸动态 (Economics)</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('半导体'); }} className={`nav-link ${activeTab === '半导体' ? 'active' : ''}`}><Map size={18} /> 供应链追踪 (Supply Chain)</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('定时报告'); }} className={`nav-link ${activeTab === '定时报告' ? 'active' : ''}`}><FileText size={18} /> 定时报告 (Reports)</a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="header">
                    <h2>实时大盘 / 政治经济动态</h2>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div className="search-bar-wrapper" style={{ position: 'relative' }}>
                            <Search size={16} color="#a0a0b0" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input type="text" className="search-bar" placeholder="搜索知识库或新闻 (e.g. 芯片)..." style={{ paddingLeft: '40px' }} />
                        </div>
                        <Bell size={20} color="#a0a0b0" style={{ cursor: 'pointer' }} />
                        <User size={20} color="#a0a0b0" style={{ cursor: 'pointer' }} />
                    </div>
                </header>

                {/* Top Metrics Grid */}
                <div className="grid-metrics animate-fade-in delay-1">
                    <div className="glass-card">
                        <div className="metric-label">日元汇率 (USD/JPY)</div>
                        <div className="metric-value">150.45</div>
                        <div className="metric-trend"><TrendingUp size={14} /> +0.2% 较上周</div>
                    </div>
                    <div className="glass-card">
                        <div className="metric-label">东证指数 (TOPIX)</div>
                        <div className="metric-value">2,750.12</div>
                        <div className="metric-trend negative"><TrendingUp size={14} style={{ transform: 'rotate(180deg)' }} /> -1.1% 较昨日</div>
                    </div>
                    <div className="glass-card">
                        <div className="metric-label">中日双边贸易额 (月度)</div>
                        <div className="metric-value">$248 亿</div>
                        <div className="metric-trend"><Clock size={14} /> 数据更新于 2 天前</div>
                    </div>
                    <div className="glass-card">
                        <div className="metric-label">风险事件监测预警</div>
                        <div className="metric-value" style={{ color: '#ff3366' }}>3 起</div>
                        <div className="metric-trend" style={{ color: '#ff3366' }}><Activity size={14} /> 需高优关注</div>
                    </div>
                </div>

                {/* Main Grid: Feed & NotebookLM Chat */}
                <div className="grid-top animate-fade-in delay-2">
                    {/* Breaking News Feed */}
                    <div className="glass-card">
                        <h3>{activeTab === '总览' ? '日本政经与涉华核心事件追踪' : `${activeTab} - 专属情报流水线`}</h3>
                        <div className="news-list">
                            {newsList.length === 0 ? (
                                <div style={{ color: '#a0a0b0', fontSize: '0.9rem', padding: '20px 0' }}>📡 正在从隧道实时拉取最新新闻...</div>
                            ) : newsList.filter(news => activeTab === '总览' || activeTab === '定时报告' ? true : news.tag === activeTab).slice(0, 5).map((news, idx) => (
                                <div className="news-item" key={idx}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <span className="news-tag">{news.tag}</span>
                                        <span className="news-tag blue">{news.source}</span>
                                    </div>
                                    <a href={news.link} target="_blank" rel="noreferrer" className="news-title" style={{ textDecoration: 'none' }}>{news.title}</a>
                                    <div className="news-meta">
                                        <span>发布时间: {new Date(news.pubDate).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* NotebookLM Chat Widget */}
                    <div className="glass-card">
                        <h3>NotebookLM 知识库助手 <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#00cc66', padding: '2px 8px', background: 'rgba(0,204,102,0.1)', borderRadius: '12px' }}>在线</span></h3>
                        <div className="chat-container">
                            <div className="chat-history">
                                {chatHistory.map((msg, idx) => (
                                    <div key={idx} className={`chat-bubble ${msg.role}`}>
                                        {msg.text}
                                    </div>
                                ))}
                            </div>
                            <div className="chat-input-wrapper">
                                <form onSubmit={handleChat}>
                                    <input
                                        type="text"
                                        className="chat-input"
                                        placeholder="向研究笔记提问..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                    />
                                    <button type="submit" className="chat-send">
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scheduled Reports Widget */}
                <div className="glass-card animate-fade-in delay-3">
                    <h3>定时分析报告 (Automated Reports)</h3>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        {reportsList.length === 0 ? (
                            <div style={{ color: '#a0a0b0', fontSize: '0.9rem' }}>目前没有找到生成的报告，请在终端执行抓取脚本。</div>
                        ) : reportsList.map((report, idx) => (
                            <div key={idx} style={{ flex: 1, minWidth: '250px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <FileText size={24} color="#3366ff" style={{ marginBottom: '12px' }} />
                                <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>{report.filename.replace('.md', '')}</div>
                                <div style={{ fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '16px' }}>
                                    文件大小: {(report.size / 1024).toFixed(2)} KB <br />
                                    生成时间: {new Date(report.date).toLocaleString()}
                                </div>
                                <button onClick={async () => {
                                    try {
                                        const res = await fetch(`${mcpUrl}/api/reports/download/${report.filename}`, {
                                            headers: { 'Bypass-Tunnel-Reminder': 'true' }
                                        });
                                        const blob = await res.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.style.display = 'none';
                                        a.href = url;
                                        a.download = report.filename;
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                    } catch (e) {
                                        console.error('Download failed', e);
                                        alert('下载报告失败，请检查终端代理是否开启。');
                                    }
                                }} style={{ background: '#3366ff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>下载查看 Markdown</button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
