import { NextResponse } from 'next/server';

const feeds = [
    { tag: "中日经贸", url: "https://news.google.com/rss/search?q=Japan+China+Economy+trade+when:7d&hl=en-US&gl=US&ceid=US:en" },
    { tag: "政治安保", url: "https://news.google.com/rss/search?q=CSIS+China+Japan+Geopolitics+when:14d&hl=en-US&gl=US&ceid=US:en" },
    { tag: "半导体", url: "https://news.google.com/rss/search?q=Supply+chain+semiconductor+China+Japan+when:7d&hl=en-US&gl=US&ceid=US:en" },
    { tag: "中日经贸", url: "https://news.google.com/rss/search?q=%E4%B8%AD%E6%97%A5+%E7%B5%8C%E6%B8%88+when:7d&hl=ja&gl=JP&ceid=JP:ja" },
    { tag: "政治安保", url: "https://news.google.com/rss/search?q=%E6%97%A5%E6%9C%AC+%E6%94%BF%E6%B2%BB+%E5%AE%89%E4%BF%9D+when:7d&hl=ja&gl=JP&ceid=JP:ja" },
    { tag: "半导体", url: "https://news.google.com/rss/search?q=%E5%8D%8A%E5%B0%8E%E4%BD%93+%E4%B8%AD%E5%9B%BD+%E4%BE%9B%E7%B5%A6%E7%B6%B2+when:7d&hl=ja&gl=JP&ceid=JP:ja" },
];

function parseRSS(xmlText: string, tag: string) {
    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xmlText)) !== null && items.length < 4) {
        const itemXml = match[1];
        const title = (/<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(itemXml) || /<title>(.*?)<\/title>/.exec(itemXml))?.[1] || '';
        const link = (/<link>(.*?)<\/link>/.exec(itemXml))?.[1] || '';
        const pubDate = (/<pubDate>(.*?)<\/pubDate>/.exec(itemXml))?.[1] || '';
        const sourceName = (/<source[^>]*>(.*?)<\/source>/.exec(itemXml))?.[1] || 'Google News';
        if (title) {
            items.push({
                title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'),
                link,
                pubDate,
                source: sourceName,
                tag,
            });
        }
    }
    return items;
}

export async function GET() {
    const fetchPromises = feeds.map(async (feed) => {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(feed.url, {
                signal: controller.signal,
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RSSReader/1.0)' },
                next: { revalidate: 1800 } // Cache for 30 minutes
            });
            clearTimeout(timeout);
            if (!res.ok) return [];
            const xml = await res.text();
            return parseRSS(xml, feed.tag);
        } catch {
            return [];
        }
    });

    const results = await Promise.allSettled(fetchPromises);
    let allNews: any[] = [];
    results.forEach(r => {
        if (r.status === 'fulfilled') allNews = allNews.concat(r.value);
    });

    // Sort by date, most recent first
    allNews.sort((a, b) => {
        const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return dateB - dateA;
    });

    if (allNews.length === 0) {
        return NextResponse.json({ news: [], error: 'RSS feeds temporarily unavailable' }, { status: 200 });
    }

    return NextResponse.json({ news: allNews });
}
