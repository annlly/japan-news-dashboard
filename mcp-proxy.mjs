import express from 'express';
import cors from 'cors';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import localtunnel from 'localtunnel';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;
const SUBDOMAIN = 'japan-intel-mcp-tunnel-' + Math.floor(Math.random() * 10000);

let mcpClient = null;

async function getMcpClient() {
    if (mcpClient) return mcpClient;

    console.log('🔄 Initializing NotebookLM MCP Connection...');
    const transport = new StdioClientTransport({
        command: 'npx',
        args: ['-y', 'notebooklm-mcp@latest']
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

        // Extract the text content from the MCP response
        // MCP tool calls usually return { content: [{ type: "text", text: "..." }] }
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
        console.error('❌ MCP Error:', error.message);
        res.status(500).json({ error: error.message });
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
