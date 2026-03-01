import { NextResponse } from 'next/server';

// ─── Platform Fetchers (inspired by newsnow/TrendRadar) ───

interface TrendItem {
  id: string;
  title: string;
  url: string;
  platform: string;
  hot?: string;
  extra?: string;
}

// ── 知乎热榜 ──
async function fetchZhihu(): Promise<TrendItem[]> {
  try {
    const url = "https://www.zhihu.com/api/v3/feed/topstory/hot-list-web?limit=20&desktop=true";
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return (data.data || []).slice(0, 15).map((k: any) => ({
      id: k.target?.link?.url?.match(/(\d+)$/)?.[1] || k.target?.link?.url || '',
      title: k.target?.title_area?.text || '',
      url: k.target?.link?.url || '',
      platform: '知乎',
      hot: k.target?.metrics_area?.text || '',
      extra: k.target?.excerpt_area?.text || '',
    }));
  } catch { return []; }
}

// ── 微博热搜 ──
async function fetchWeibo(): Promise<TrendItem[]> {
  try {
    const url = "https://weibo.com/ajax/side/hotSearch";
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      next: { revalidate: 300 },
    });
    const data = await res.json();
    const list = data?.data?.realtime || [];
    return list.slice(0, 15).map((k: any) => ({
      id: k.word || '',
      title: k.word || '',
      url: `https://s.weibo.com/weibo?q=${encodeURIComponent('#' + k.word + '#')}`,
      platform: '微博',
      hot: k.num ? `${Math.floor(k.num / 10000)}万` : '',
      extra: k.label_name || '',
    }));
  } catch { return []; }
}

// ── 百度热搜 ──
async function fetchBaidu(): Promise<TrendItem[]> {
  try {
    const url = "https://top.baidu.com/board?tab=realtime";
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      next: { revalidate: 300 },
    });
    const html = await res.text();
    const jsonStr = html.match(/<!--s-data:([\s\S]*?)-->/);
    if (!jsonStr) return [];
    const data = JSON.parse(jsonStr[1]);
    return (data.data?.cards?.[0]?.content || []).filter((k: any) => !k.isTop).slice(0, 15).map((k: any) => ({
      id: k.rawUrl || '',
      title: k.word || '',
      url: k.rawUrl || '',
      platform: '百度',
      hot: k.hotScore ? `${Math.floor(k.hotScore / 10000)}万` : '',
      extra: k.desc || '',
    }));
  } catch { return []; }
}

// ── 今日头条 ──
async function fetchToutiao(): Promise<TrendItem[]> {
  try {
    const url = "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc";
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return (data.data || []).slice(0, 15).map((k: any) => ({
      id: k.ClusterIdStr || '',
      title: k.Title || '',
      url: `https://www.toutiao.com/trending/${k.ClusterIdStr}/`,
      platform: '头条',
      hot: k.HotValue || '',
    }));
  } catch { return []; }
}

// ── B站热搜 ──
async function fetchBilibili(): Promise<TrendItem[]> {
  try {
    const url = "https://s.search.bilibili.com/main/hotword?limit=30";
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return (data.list || []).slice(0, 15).map((k: any) => ({
      id: k.keyword || '',
      title: k.show_name || k.keyword || '',
      url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(k.keyword)}`,
      platform: 'B站',
      hot: k.heat_score ? `${k.heat_score}` : '',
    }));
  } catch { return []; }
}

// ── 抖音热搜 ──
async function fetchDouyin(): Promise<TrendItem[]> {
  try {
    const url = "https://www.douyin.com/aweme/v1/web/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&detail_list=1";
    const cookieRes = await fetch("https://www.douyin.com/", {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const cookies = cookieRes.headers.getSetCookie?.() || [];
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'cookie': cookies.join('; '),
      },
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return (data.data?.word_list || []).slice(0, 15).map((k: any) => ({
      id: k.sentence_id || '',
      title: k.word || '',
      url: `https://www.douyin.com/hot/${k.sentence_id}`,
      platform: '抖音',
      hot: k.hot_value || '',
    }));
  } catch { return []; }
}

// ── 贴吧热议 ──
async function fetchTieba(): Promise<TrendItem[]> {
  try {
    const url = "https://tieba.baidu.com/hottopic/browse/topicList";
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return (data.data?.bang_topic?.topic_list || []).slice(0, 15).map((k: any) => ({
      id: k.topic_id || '',
      title: k.topic_name || '',
      url: k.topic_url || '',
      platform: '贴吧',
    }));
  } catch { return []; }
}

// ── 华尔街见闻 ──
async function fetchWallstreetcn(): Promise<TrendItem[]> {
  try {
    const url = "https://api-one.wallstcn.com/apiv1/content/articles/hot?period=all";
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return (data.data?.day_items || []).slice(0, 15).map((k: any) => ({
      id: String(k.id || ''),
      title: k.title || '',
      url: k.uri || '',
      platform: '华尔街见闻',
    }));
  } catch { return []; }
}

// ── 澎湃新闻 ──
async function fetchThepaper(): Promise<TrendItem[]> {
  try {
    const url = "https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar";
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return (data.data?.hotNews || []).slice(0, 15).map((k: any) => ({
      id: k.contId || '',
      title: k.name || '',
      url: `https://www.thepaper.cn/newsDetail_forward_${k.contId}`,
      platform: '澎湃',
    }));
  } catch { return []; }
}

// ── 凤凰网 ──
async function fetchIfeng(): Promise<TrendItem[]> {
  try {
    const url = "https://www.ifeng.com/";
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      next: { revalidate: 300 },
    });
    const html = await res.text();
    const regex = /var\s+allData\s*=\s*(\{[\s\S]*?\});/;
    const match = regex.exec(html);
    if (!match) return [];
    const realData = JSON.parse(match[1]);
    return (realData.hotNews1 || []).slice(0, 15).map((k: any) => ({
      id: k.url || '',
      title: k.title || '',
      url: k.url || '',
      platform: '凤凰网',
    }));
  } catch { return []; }
}

// ── 财联社 ──
async function fetchCLS(): Promise<TrendItem[]> {
  try {
    const url = "https://www.cls.cn/v3/depth/home/assembled/1000?app=CailianpressWeb&os=web&sv=8.4.6";
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      next: { revalidate: 300 },
    });
    const data = await res.json();
    const articles = data?.data?.depth_list || [];
    return articles.slice(0, 15).map((k: any) => ({
      id: String(k.id || ''),
      title: k.title || k.brief || '',
      url: `https://www.cls.cn/detail/${k.id}`,
      platform: '财联社',
    }));
  } catch { return []; }
}

// ─── Main GET handler ───
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platformParam = searchParams.get('platform');

  const platformMap: Record<string, () => Promise<TrendItem[]>> = {
    zhihu: fetchZhihu,
    weibo: fetchWeibo,
    baidu: fetchBaidu,
    toutiao: fetchToutiao,
    bilibili: fetchBilibili,
    douyin: fetchDouyin,
    tieba: fetchTieba,
    wallstreetcn: fetchWallstreetcn,
    thepaper: fetchThepaper,
    ifeng: fetchIfeng,
    cls: fetchCLS,
  };

  try {
    if (platformParam && platformMap[platformParam]) {
      // Fetch specific platform
      const items = await platformMap[platformParam]();
      return NextResponse.json({ platform: platformParam, items, count: items.length });
    }

    // Fetch all platforms in parallel
    const entries = Object.entries(platformMap);
    const results = await Promise.allSettled(
      entries.map(async ([name, fetcher]) => {
        const items = await fetcher();
        return { name, items };
      })
    );

    const platforms: Record<string, TrendItem[]> = {};
    let totalCount = 0;
    results.forEach((r) => {
      if (r.status === 'fulfilled') {
        platforms[r.value.name] = r.value.items;
        totalCount += r.value.items.length;
      }
    });

    return NextResponse.json({
      platforms,
      totalCount,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch trending data' }, { status: 500 });
  }
}
