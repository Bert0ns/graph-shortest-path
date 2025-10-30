import Link from 'next/link'
import { websiteConfigs } from '@/website.configs'
import {examples} from "@/lib/graph/examples";


export default function HomeLanding() {

  return (
    <main className="container mx-auto p-6 space-y-10 max-w-4xl">
      <section className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{websiteConfigs.title}</h1>
        <p className="text-muted-foreground max-w-3xl">
          {websiteConfigs.description} This app helps you understand shortest‑path algorithms through a
          clean, step‑by‑step visualization.
        </p>
        <p className="text-muted-foreground max-w-3xl">
          What you can do here: build or import graphs, pick a start and end node, and watch the
          algorithm discover the shortest path. Use the Builder to create your own graphs or tweak
          coordinates and edges.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/simulator" className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90">
            Open Simulator
          </Link>
          <Link href="/builder" className="inline-flex items-center px-4 py-2 rounded-md border border-border hover:bg-accent">
            Open Builder
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Try it with example graphs</h2>
        <p className="text-muted-foreground">Pick an example to jump into the simulator already loaded with that graph.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {examples.map((ex) => (
            <Link key={ex.href} href={ex.href}
                  className="group block rounded-md border border-border p-4 hover:border-primary transition-colors bg-card/70">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-foreground group-hover:text-primary">{ex.title}</h3>
                <span className="text-xs text-foreground/60 whitespace-nowrap">{ex.meta}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{ex.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
