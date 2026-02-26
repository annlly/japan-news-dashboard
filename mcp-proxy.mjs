import express from 'express';
import cors from 'cors';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import localtunnel from 'localtunnel';
import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;
const SUBDOMAIN = 'japan-intel-mcp-tunnel-vip';

let mcpClient = null;

async function getMcpClient() {
    if (mcpClient) return mcpClient;

    const transport = new StdioClientTransport({
        command: 'sh',
        args: ['-c', 'cd /tmp && npx -y notebooklm-mcp@latest']
    });

    const client = new Client(
        { name: 'dashboard-proxy', version: '1.0.0' },
        { capabilities: { tools: {} } }
    );

    await client.connect(transport);
    mcpClient = client;
    console.log('✅ Connected to NotebookLM MCP!');
    return client;
}

app.post('/api/chat', async (req, res) => {
    try {
        const { question, notebook_id } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        const client = await getMcpClient();

        console.log(`🤖 Querying NotebookLM: "${question}"`);

        const result = await client.request({
            method: "tools/call",
            params: {
                name: 'ask_question',
                arguments: {
                    question: question,
                    notebook_id: notebook_id || undefined
                }
            }
        }, globalThis.Object || undefined);

        let answerText = "Unable to parse NotebookLM response.";
        if (result && result.content && result.content.length > 0) {
            answerText = result.content[0].text;
        } else if (result && result.text) {
            answerText = result.text;
        } else if (typeof result === 'string') {
            answerText = result;
        }

        res.json({ answer: answerText });

    } catch (error) {
        console.error('❌ MCP Error:', error.stack);
        res.status(500).json({ error: error.message });
    }
});

const parser = new Parser({
    customFields: {
        item: ['dc:creator', 'creator']
    }
});
const feeds = [
    // Japanese Sources
    { tag: "中日经贸", url: "https://news.google.com/rss/search?q=%E4%B8%AD%E6%97%A5+%E7%B5%8C%E6%B8%88+when:7d&hl=ja&gl=JP&ceid=JP:ja" },
    { tag: "政治安保", url: "https://news.google.com/rss/search?q=%E6%97%A5%E6%9C%AC+%E6%94%BF%E6%B2%BB+%E5%AE%89%E4%BF%9D+when:7d&hl=ja&gl=JP&ceid=JP:ja" },
    { tag: "半导体", url: "https://news.google.com/rss/search?q=%E5%8D%8A%E5%B0%8E%E4%F%93+%E4%BE%9B%E7%B5%A6%E7%B6%B2+%E4%B8%AD%E5%9B%BD+when:7d&hl=ja&gl=JP&ceid=JP:ja" },

    // English & Think Tank Sources
    { tag: "中日经贸", url: "https://news.google.com/rss/search?q=Japan+China+Economy+trade+when:7d&hl=en-US&gl=US&ceid=US:en" },  // English Google News 
    { tag: "政治安保", url: "https://news.google.com/rss/search?q=CSIS+China+Geopolitics+when:14d&hl=en-US&gl=US&ceid=US:en" }, // CSIS Think Tank (Top Geopolitics)
    { tag: "半导体", url: "https://news.google.com/rss/search?q=Supply+chain+semiconductor+China+when:7d&hl=en-US&gl=US&ceid=US:en" }, // Tech & Supply Chain English

    // Japanese Think Tanks (政策型 / 综合企业型智库)
    { tag: "政治安保", url: "https://news.google.com/rss/search?q=(日本国際問題研究所+OR+防衛研究所)+when:14d&hl=ja&gl=JP&ceid=JP:ja" }, // JIIA & NIDS
    { tag: "中日经贸", url: "https://news.google.com/rss/search?q=(経済産業研究所+OR+アジア経済研究所+OR+総合研究開発機構)+when:14d&hl=ja&gl=JP&ceid=JP:ja" }, // RIETI, IDE-JETRO, NIRA
    { tag: "中日经贸", url: "https://news.google.com/rss/search?q=(野村総合研究所+OR+三菱総合研究所+OR+日本総合研究所)+when:14d&hl=ja&gl=JP&ceid=JP:ja" }, // NRI, MRI, JRI
    { tag: "半导体", url: "https://news.google.com/rss/search?q=(三菱UFJリサーチ＆コンサルティング+OR+みずほリサーチ)+半導体+when:14d&hl=ja&gl=JP&ceid=JP:ja" } // MURC, Mizuho + Supply Chain
];

app.get('/api/news', async (req, res) => {
    try {
        let allNews = [];
        for (const feed of feeds) {
            try {
                // Encode Japanese chars and parentheses properly for the node http client
                const safeUrl = encodeURI(feed.url).replace(/\(/g, '%28').replace(/\)/g, '%29');
                const parsed = await parser.parseURL(safeUrl);
                const items = parsed.items.slice(0, 3).map(i => ({
                    title: i.title,
                    link: i.link,
                    pubDate: i.pubDate,
                    source: i.source || '新闻来源',
                    tag: feed.tag
                }));
                allNews = allNews.concat(items);
            } catch (err) {
                console.error(`❌ RSS Fetch Error for ${feed.tag} (${feed.url}):`, err.message);
            }
        }
        res.json({ news: allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const getReportDir = () => {
    const userHome = process.env.HOME || process.env.USERPROFILE;
    return path.join(userHome, 'Documents', 'Japan_News_Reports');
};

app.get('/api/reports', (req, res) => {
    const reportDir = getReportDir();
    if (!fs.existsSync(reportDir)) {
        return res.json({ reports: [] });
    }
    const files = fs.readdirSync(reportDir).filter(f => f.endsWith('.md'));
    const reports = files.map(f => {
        const stats = fs.statSync(path.join(reportDir, f));
        return { filename: f, date: stats.mtime, size: stats.size };
    }).sort((a, b) => b.date - a.date);
    res.json({ reports });
});

app.get('/api/reports/download/:filename', (req, res) => {
    const filepath = path.join(getReportDir(), req.params.filename);
    if (fs.existsSync(filepath)) {
        res.download(filepath);
    } else {
        res.status(404).send('File not found');
    }
});

app.listen(PORT, async () => {
    console.log(`\n🚀 Local Express server running at http://localhost:${PORT}`);

    try {
        const tunnel = await localtunnel({ port: PORT, subdomain: SUBDOMAIN });

        console.log(`\n======================================================`);
        console.log(`🔗 你的专属穿透地址已生成: ${tunnel.url}`);
        console.log(`👉 请将此地址填写到你的 Vercel 环境变量 NEXT_PUBLIC_MCP_URL 中`);
        console.log(`======================================================\n`);

        tunnel.on('close', () => {
            console.log('隧道已关闭');
        });
    } catch (err) {
        console.error('Failed to create localtunnel:', err.message);
    }
});
