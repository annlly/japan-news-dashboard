import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
    const { filename } = await params;
    // Basic security: no path traversal
    if (!filename || filename.includes('..') || !filename.endsWith('.md')) {
        return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }
    const filepath = path.join(process.env.HOME || '/tmp', 'Documents', 'Japan_News_Reports', filename);
    if (!existsSync(filepath)) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const content = readFileSync(filepath, 'utf-8');
    return new NextResponse(content, {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
        }
    });
}
