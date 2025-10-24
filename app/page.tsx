import GraphSimulator from '@/components/GraphSimulator'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Shortest Path Visualizer</h1>
        <Link href="/builder"><Button variant="outline">Open Graph Builder</Button></Link>
      </div>
      <GraphSimulator />
    </main>
  )
}
