import { NextResponse } from 'next/server';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import path from 'path';

export async function GET() {
    try {
        const reportDir = path.join(process.env.HOME || '/tmp', 'Documents', 'Japan_News_Reports');
        if (!existsSync(reportDir)) {
            return NextResponse.json({ reports: [] });
        }
        const files = readdirSync(reportDir).filter((f: string) => f.endsWith('.md'));
        const reports = files.map((f: string) => {
            const stats = statSync(path.join(reportDir, f));
            return { filename: f, date: stats.mtime, size: stats.size };
        }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return NextResponse.json({ reports });
    } catch {
        return NextResponse.json({ reports: [] });
    }
}
