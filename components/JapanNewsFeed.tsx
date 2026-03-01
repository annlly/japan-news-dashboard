import React from 'react';
import { Zap, Clock, ExternalLink, WifiOff } from 'lucide-react';

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
    tag: string;
}

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

export function JapanNewsFeed({ activeTab, newsList, loading, error }: {
    activeTab: string;
    newsList: NewsItem[];
    loading: boolean;
    error: boolean;
}) {
    const filteredNews = activeTab === '总览' || activeTab === '定时报告'
        ? newsList
        : newsList.filter(n => n.tag === activeTab ||
            (activeTab === '政治安保' && n.tag === '政治安保') ||
            (activeTab === '中日经贸' && n.tag === '中日经贸') ||
            (activeTab === '半导体' && n.tag === '半导体'));

    return (
        <div className="glass-card news-card flex flex-col h-full">
            <div className="card-header">
                <h3>
                    <Zap size={16} className="card-icon" />
                    {activeTab === '总览' ? '日本政经·涉华核心事件追踪' : `${activeTab} — 专属情报流`}
                </h3>
                <div className="live-badge">
                    <span className="live-dot" />LIVE
                </div>
            </div>

            <div className="news-list flex-1 overflow-y-auto pr-2 max-h-[500px]">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="news-skeleton">
                            <div className="skel skel-tag" />
                            <div className="skel skel-title" />
                            <div className="skel skel-meta" />
                        </div>
                    ))
                ) : filteredNews.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 flex flex-col items-center">
                        <WifiOff size={24} className="mb-2 opacity-50" />
                        <span>该平台暂无数据</span>
                    </div>
                ) : filteredNews.slice(0, 10).map((news, idx) => {
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
    );
}
