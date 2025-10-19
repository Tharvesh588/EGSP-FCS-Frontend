
import { NextRequest, NextResponse } from 'next/server';

// This is a very basic parser. A library like 'cheerio' would be more robust.
const parseMetaTag = (html: string, property: string): string | null => {
    const regex = new RegExp(`<meta (property|name)="${property}" content="([^"]*)"`);
    const match = html.match(regex);
    return match ? match[2] : null;
};

const parseTitle = (html: string): string | null => {
    const match = html.match(/<title>([^<]*)<\/title>/);
    return match ? match[1] : null;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch URL, status: ${response.status}`);
        }

        const html = await response.text();

        const title = parseMetaTag(html, 'og:title') || parseTitle(html);
        const description = parseMetaTag(html, 'og:description') || parseMetaTag(html, 'description');
        const image = parseMetaTag(html, 'og:image');

        const metadata = {
            url,
            title,
            description,
            image,
        };

        return NextResponse.json(metadata);

    } catch (error: any) {
        console.error(`Error fetching metadata for ${url}:`, error);
        return NextResponse.json({ error: 'Failed to fetch metadata', details: error.message }, { status: 500 });
    }
}
