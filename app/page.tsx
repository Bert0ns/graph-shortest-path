import Link from 'next/link'
import {websiteConfigs} from '@/website.configs'
import React from "react";
import {Button} from "@/components/ui/button";
import ExampleGraphCards from "@/components/exampleGraphCards";


export default function HomeLanding() {


    return (
        <main className="container mx-auto p-6 space-y-10 max-w-4xl">
            <section className="space-y-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{websiteConfigs.title}</h1>
                <p className="text-muted-foreground max-w-3xl">
                    {websiteConfigs.description}
                    <br/>
                    This app helps you understand shortest‑path algorithms through a
                    clean, step‑by‑step visualization.
                </p>
                <p className="text-muted-foreground max-w-3xl">
                    What you can do here: build or import graphs, pick a start and end node, and watch the
                    algorithm discover the shortest path.
                    <br/>
                    Use the Builder to create your own graphs or tweak
                    coordinates and edges.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link href={websiteConfigs.menuItems[1].link}>
                        <Button variant="default" size="lg">
                            Open Simulator
                        </Button>
                    </Link>
                    <Link href={websiteConfigs.menuItems[2].link}>
                        <Button variant="outline" size="lg">
                            Open Builder
                        </Button>
                    </Link>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Try it with example graphs</h2>
                <p className="text-muted-foreground">
                    Pick an example to jump into the simulator already loaded with that
                    graph.
                </p>
                <ExampleGraphCards className="grid gap-4 sm:grid-cols-2"/>
            </section>
        </main>
    )
}
