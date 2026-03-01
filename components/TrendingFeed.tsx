import React, { useState, useEffect } from 'react';
import { Activity, ExternalLink, RefreshCw, WifiOff } from 'lucide-react';

interface TrendItem {
    id: string;
    title: string;
    url: string;
    platform: string;
    hot?: string;
    extra?: string;
}

const PLATFORMS = [
    { id: 'zhihu', name: '知乎' },
    { id: 'weibo', name: '微博' },
    { id: 'baidu', name: '百度' },
    { id: 'toutiao', name: '头条' },
    { id: 'bilibili', name: 'B站' },
    { id: 'douyin', name: '抖音' },
    { id: 'tieba', name: '贴吧' },
    { id: 'wallstreetcn', name: '华尔街见闻' },
    { id: 'thepaper', name: '澎湃' },
    { id: 'ifeng', name: '凤凰网' },
    { id: 'cls', name: '财联社' },
];

export function TrendingFeed() {
    const [activePlatform, setActivePlatform] = useState('zhihu');
    const [trends, setTrends] = useState<TrendItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchTrends = async (platformId: string) => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`/api/trending?platform=${platformId}`);
            if (!res.ok) throw new Error('Fetch failed');
            const data = await res.json();
            setTrends(data.items || []);
        } catch {
            setError(true);
            setTrends([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrends(activePlatform);
    }, [activePlatform]);

    return (
        <div className="glass-card trending-card flex flex-col h-full">
            <div className="card-header pb-2">
                <h3><Activity size={16} className="card-icon" /> 中国全网热搜聚合</h3>
                <button className="icon-btn" onClick={() => fetchTrends(activePlatform)} title="刷新热点">
                    <RefreshCw size={14} className={loading ? 'spin' : ''} />
                </button>
            </div>

            {/* Platform Selection Tabs */}
            <div className="platform-tabs text-sm flex gap-2 overflow-x-auto pb-3 mb-3 border-b border-white/10 scrollbar-hide">
                {PLATFORMS.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setActivePlatform(p.id)}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-full transition-colors ${activePlatform === p.id
                            ? 'bg-[var(--accent)] text-white'
                            : 'bg-white/5 hover:bg-white/10 text-[var(--muted)]'
                            }`}
                    >
                        {p.name}
                    </button>
                ))}
            </div>

            <div className="news-list flex-1 overflow-y-auto pr-2 max-h-[500px]">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="news-skeleton">
                            <div className="skel skel-title" />
                            <div className="skel skel-meta" />
                        </div>
                    ))
                ) : error || trends.length === 0 ? (
                    <div className="py-8 text-center text-[var(--muted)] flex flex-col items-center">
                        <WifiOff size={24} className="mb-2 opacity-50" />
                        <span>无法获取当前平台数据</span>
                    </div>
                ) : (
                    trends.map((item, idx) => (
                        <div className="news-item py-3" key={item.id || idx}>
                            <div className="flex gap-2 items-start mb-1">
                                <span className="text-xs font-bold text-[var(--muted)] w-5 shrink-0 text-center">
                                    {idx + 1}.
                                </span>
                                <a href={item.url} target="_blank" rel="noreferrer" className="news-title flex-1 hover:text-[var(--accent)] font-medium">
                                    {item.title}
                                    <ExternalLink size={11} className="ext-icon inline-block ml-1 opacity-50" />
                                </a>
                            </div>
                            {(item.hot || item.extra) && (
                                <div className="news-meta pl-7 text-xs flex gap-3 text-[var(--muted)] opacity-80">
                                    {item.hot && <span>🔥 {item.hot}</span>}
                                    {item.extra && <span className="line-clamp-1">{item.extra}</span>}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
