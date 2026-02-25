import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser();

const feeds = [
    {
        name: "中日经贸 (Google News)",
        url: "https://news.google.com/rss/search?q=%E4%B8%AD%E6%97%A5+%E7%B5%8C%E6%B8%88+when:7d&hl=ja&gl=JP&ceid=JP:ja"
    },
    {
        name: "中日经贸 (英文视角)",
        url: "https://news.google.com/rss/search?q=Japan+China+Economy+trade+when:7d&hl=en-US&gl=US&ceid=US:en"
    },
    {
        name: "日本政治安保 (Google News)",
        url: "https://news.google.com/rss/search?q=%E6%97%A5%E6%9C%AC+%E6%94%BF%E6%B2%BB+%E5%AE%89%E4%BF%9D+when:7d&hl=ja&gl=JP&ceid=JP:ja"
    },
    {
        name: "地缘政治与安全 (CSIS 智库)",
        url: "https://www.csis.org/rss/articles"
    },
    {
        name: "半导体供应链 (Google News JP)",
        url: "https://news.google.com/rss/search?q=%E5%8D%8A%E5%B0%8E%E4%F%93+%E4%BE%9B%E7%B5%A6%E7%B6%B2+%E4%B8%AD%E5%9B%BD+when:7d&hl=ja&gl=JP&ceid=JP:ja"
    },
    {
        name: "半导体供应链 (英文视角)",
        url: "https://news.google.com/rss/search?q=Supply+chain+semiconductor+China+when:7d&hl=en-US&gl=US&ceid=US:en"
    },
    {
        name: "日本政策型智库 (JIIA & NIDS)",
        url: "https://news.google.com/rss/search?q=(日本国際問題研究所+OR+防衛研究所)+when:14d&hl=ja&gl=JP&ceid=JP:ja"
    },
    {
        name: "日本经济政策智库 (RIETI, IDE-JETRO, NIRA)",
        url: "https://news.google.com/rss/search?q=(経済産業研究所+OR+アジア経済研究所+OR+総合研究開発機構)+when:14d&hl=ja&gl=JP&ceid=JP:ja"
    },
    {
        name: "日本企业型综合智库 (NRI, MRI, JRI)",
        url: "https://news.google.com/rss/search?q=(野村総合研究所+OR+三菱総合研究所+OR+日本総合研究所)+when:14d&hl=ja&gl=JP&ceid=JP:ja"
    },
    {
        name: "日本金融智库与半导体 (MURC, Mizuho)",
        url: "https://news.google.com/rss/search?q=(三菱UFJリサーチ＆コンサルティング+OR+みずほリサーチ)+半導体+when:14d&hl=ja&gl=JP&ceid=JP:ja"
    }
];

async function fetchAndGenerateReport() {
    const dateStr = new Date().toISOString().split('T')[0];
    const userHome = process.env.HOME || process.env.USERPROFILE;
    const reportDir = path.join(userHome, 'Documents', 'Japan_News_Reports');

    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `J_CN_Intel_Report_${dateStr}.md`);
    let markdownContent = `# 🇯🇵🇨🇳 日中政经情报简报 (自动生成)\n\n`;
    markdownContent += `**生成日期**: ${dateStr}\n\n`;
    markdownContent += `> 💡 **使用指南**：本报告为系统自动抓取的过去一周内的核心新闻语料。您可以直接将此 Markdown 文件拖入 NotebookLM 网页版，作为分析“大国竞争”、“日本战略转型”及“供应链重组”的最热基础数据。\n\n---\n\n`;

    for (const feed of feeds) {
        try {
            console.log(`📡 正在抓取: ${feed.name}...`);
            const parsed = await parser.parseURL(feed.url);

            markdownContent += `## 📌 主题：${feed.name}\n\n`;

            // 取前 10 条新闻
            const items = parsed.items.slice(0, 10);
            items.forEach((item, index) => {
                markdownContent += `### ${index + 1}. [${item.title}](${item.link})\n`;
                markdownContent += `- **发布机构/时间**: ${item.pubDate || '未知时间'}\n`;
                markdownContent += `- **简述摘要**: ${item.contentSnippet ? item.contentSnippet.replace(/\n/g, ' ') : '点击标题查看全文'}\n\n`;
            });

        } catch (error) {
            console.error(`❌ 抓取 ${feed.name} 失败: ${error.message}`);
            markdownContent += `## 📌 主题：${feed.name}\n\n> ⚠️ 抓取失败或源站受限。\n\n`;
        }
    }

    fs.writeFileSync(reportPath, markdownContent, 'utf-8');
    console.log(`\n✅ 报告已成功生成！`);
    console.log(`📁 保存路径: ${reportPath}`);
    console.log(`\n👉 现在你可以打开 Finder找到该文件，并拖入 NotebookLM 平台了！`);
}

fetchAndGenerateReport();
