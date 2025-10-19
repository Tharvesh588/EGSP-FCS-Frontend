
"use client";

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

type LinkMetadata = {
    title?: string;
    description?: string;
    image?: string;
    url: string;
};

async function fetchLinkMetadata(url: string): Promise<LinkMetadata | null> {
    try {
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch link metadata:", error);
        return null;
    }
}

export function LinkPreviewCard({ url }: { url: string }) {
    const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        fetchLinkMetadata(url).then(data => {
            if (isMounted) {
                setMetadata(data);
                setIsLoading(false);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [url]);

    if (isLoading) {
        return (
            <div className="mt-2 space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
            </div>
        );
    }
    
    if (!metadata || (!metadata.title && !metadata.description)) {
        return null;
    }

    const getDomain = (link: string) => {
        try {
            return new URL(link).hostname;
        } catch {
            return '';
        }
    }

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 block">
            <Card className="overflow-hidden bg-background hover:bg-accent/50 transition-colors">
                {metadata.image && (
                    <img src={metadata.image} alt={metadata.title || ''} className="w-full h-32 object-cover" />
                )}
                <div className="p-3">
                    <p className="text-xs text-muted-foreground truncate">{getDomain(url)}</p>
                    <p className="text-sm font-semibold text-foreground truncate">{metadata.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{metadata.description}</p>
                </div>
            </Card>
        </a>
    );
}

