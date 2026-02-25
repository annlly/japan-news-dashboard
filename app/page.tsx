'use client';

import React, { useState } from 'react';
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: chatInput })
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
                    <a href="#" className="nav-link active"><BarChart3 size={18} /> 总览 (Overview)</a>
                    <a href="#" className="nav-link"><Globe2 size={18} /> 地缘政治 (Geopolitics)</a>
                    <a href="#" className="nav-link"><Briefcase size={18} /> 经贸动态 (Economics)</a>
                    <a href="#" className="nav-link"><Map size={18} /> 供应链追踪 (Supply Chain)</a>
                    <a href="#" className="nav-link"><FileText size={18} /> 定时报告 (Reports)</a>
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
                        <h3>日本政经与涉华核心事件追踪</h3>
                        <div className="news-list">
                            <div className="news-item">
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span className="news-tag">经济安保</span>
                                    <span className="news-tag blue">涉华</span>
                                </div>
                                <div className="news-title">日本政府拟扩大尖端技术出口管制范围，半导体材料及制造设备为重点监控对象</div>
                                <div className="news-meta">
                                    <span>来自: 日本经济新闻 (Nikkei)</span>
                                    <span>2 小时前</span>
                                </div>
                            </div>
                            <div className="news-item">
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span className="news-tag blue">政治</span>
                                </div>
                                <div className="news-title">自民党内部派阀重组：高市早苗派系提出新版“亚洲印太战略”框架，强调供应链韧性</div>
                                <div className="news-meta">
                                    <span>来自: 读卖新闻 (Yomiuri)</span>
                                    <span>5 小时前</span>
                                </div>
                            </div>
                            <div className="news-item">
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span className="news-tag">经贸</span>
                                    <span className="news-tag blue">涉华</span>
                                </div>
                                <div className="news-title">中日举行第X轮高级别双边经济对话，焦点集中于新能源汽车市场准入与反倾销调查</div>
                                <div className="news-meta">
                                    <span>来自: 共同社 (Kyodo)</span>
                                    <span>14 小时前</span>
                                </div>
                            </div>
                            <div className="news-item">
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span className="news-tag">宏观</span>
                                </div>
                                <div className="news-title">日本央行结束负利率时代后的首次政策评估会议：对企业出海投资的影响深度分析</div>
                                <div className="news-meta">
                                    <span>来自: 彭博社 (Bloomberg JP)</span>
                                    <span>昨天</span>
                                </div>
                            </div>
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
                        <div style={{ flex: 1, minWidth: '250px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <FileText size={24} color="#3366ff" style={{ marginBottom: '12px' }} />
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>本周地缘经济纪要</div>
                            <div style={{ fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '16px' }}>系统已于周一 08:00 自动生成了整合过去7天新闻与NotebookLM洞察的综述报告。</div>
                            <button style={{ background: '#3366ff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>下载 PDF</button>
                        </div>

                        <div style={{ flex: 1, minWidth: '250px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <BarChart3 size={24} color="#ff3366" style={{ marginBottom: '12px' }} />
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>中日经贸月度简报</div>
                            <div style={{ fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '16px' }}>基于海关数据与学术知识库对比生成的月度双边贸易分析，下个月 1 号自动生成。</div>
                            <button style={{ background: 'transparent', color: '#ff3366', border: '1px solid #ff3366', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>查看上期</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
