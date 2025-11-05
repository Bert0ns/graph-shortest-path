"use client"
import React, {useEffect} from "react";
import ExampleGraphCardLoader from "@/components/exampleGraphCardLoader";
import {getExampleUrlsOnce} from "@/lib/example_graphs_cache";

export interface ExampleGraphCardsProps {
    className: string;
}

const ExampleGraphCards = ({ className = " " }: ExampleGraphCardsProps) => {
    const [urls, setUrls] = React.useState<string[]>([]);
    const [listError, setListError] = React.useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        getExampleUrlsOnce()
            .then((u) => {
                if (!cancelled) setUrls(u);
            })
            .catch((e) => {
                if (!cancelled) {
                    setListError(e?.message ?? "Impossibile ottenere l'elenco dei grafi");
                    setUrls([]);
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    if (listError) {
        return (
            <div className={className}>
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-destructive">
                    {listError}
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            {urls.map((url) => (
                <ExampleGraphCardLoader key={url} url={url} />
            ))}
        </div>
    );
};

export default ExampleGraphCards;