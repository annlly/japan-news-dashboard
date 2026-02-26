import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { question } = await req.json();
        if (!question) return NextResponse.json({ error: 'Question required' }, { status: 400 });

        // Try local MCP proxy if configured
        const mcpUrl = process.env.MCP_PROXY_URL || process.env.NEXT_PUBLIC_MCP_URL;
        if (mcpUrl) {
            try {
                const res = await fetch(`${mcpUrl}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
                    body: JSON.stringify({ question }),
                    signal: AbortSignal.timeout(12000),
                });
                const data = await res.json();
                if (data.answer) return NextResponse.json({ answer: data.answer });
            } catch {
                // fallback below
            }
        }

        return NextResponse.json({
            answer: `📚 NotebookLM 代理暂时离线。\n\n**查询**：${question}\n\n请在本地运行 \`node mcp-proxy.mjs\` 并在 Vercel 配置 \`MCP_PROXY_URL\` 环境变量后重试。`
        });
    } catch {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
