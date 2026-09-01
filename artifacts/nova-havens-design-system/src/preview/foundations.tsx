import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { NativeSelect } from '../components/ui/native-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Guidelines } from './parts';

const CORE_SWATCHES = [
  { name: 'Primary · Nova gold', className: 'bg-primary' },
  { name: 'Secondary · deep surface', className: 'bg-secondary' },
  { name: 'Accent · raised surface', className: 'bg-accent' },
] as const;

const SUPPORTING_SWATCHES = [
  { name: 'Background', className: 'border bg-background' },
  { name: 'Foreground', className: 'bg-foreground' },
  { name: 'Muted', className: 'bg-muted' },
  { name: 'Destructive', className: 'bg-destructive' },
  { name: 'Border', className: 'bg-border' },
] as const;

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="space-y-2">
      <div className={`h-16 rounded-lg ${className}`} />
      <p className="text-sm font-medium">{name}</p>
    </div>
  );
}

export function OverviewPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-6 text-card-foreground">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Source-backed pilot
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight">
          Calm, direct interfaces for urgent housing decisions.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Nova Havens uses restrained dark surfaces, one confident gold, warm
          white type, and rounded but grounded controls to make high-stakes
          actions feel clear.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Audience switcher</CardTitle>
            <CardDescription>
              Tabs keep related paths together without adding visual noise.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="family">
              <TabsList>
                <TabsTrigger value="family">Family</TabsTrigger>
                <TabsTrigger value="adjuster">Adjuster</TabsTrigger>
                <TabsTrigger value="owner">Owner</TabsTrigger>
              </TabsList>
              <TabsContent value="family" className="rounded-md border p-4 text-sm">
                Find furnished housing quickly.
              </TabsContent>
              <TabsContent value="adjuster" className="rounded-md border p-4 text-sm">
                Coordinate a clear placement.
              </TabsContent>
              <TabsContent value="owner" className="rounded-md border p-4 text-sm">
                Add a verified property.
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request details</CardTitle>
            <CardDescription>
              The form primitives pair accessible structure with compact density.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Your name" aria-label="Your name" />
            <NativeSelect placeholder="What do you need?">
              <option value="housing">Emergency housing</option>
              <option value="property">List a property</option>
            </NativeSelect>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button>Request housing</Button>
              <Button variant="outline">Learn more</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-xl border bg-card p-6 text-card-foreground">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          System principles
        </h2>
        <div className="mt-4">
          <Guidelines
            items={[
              { kind: 'do', text: 'Use the single gold accent for action, focus, links, and compact emphasis.' },
              { kind: 'do', text: 'Let scale and weight carry large headline emphasis instead of coloring large type gold.' },
              { kind: 'dont', text: 'Introduce a second gold, fill large surfaces with gold, or place gold in body copy.' },
              { kind: 'dont', text: 'Use off-white text on gold fills; the near-black primary foreground is required.' },
            ]}
          />
        </div>
      </section>
    </div>
  );
}

export function BrandPage() {
  return (
    <div className="space-y-6 rounded-xl border bg-card p-6 text-card-foreground">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Wordmark treatment
        </p>
        <div className="mt-5 inline-flex rounded-xl border bg-background px-6 py-5 text-3xl tracking-tight">
          <span className="font-extrabold text-foreground">Nova</span>
          <span className="font-extrabold text-primary">Havens</span>
        </div>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          The source uses a text wordmark rather than a standalone image mark.
          “Nova” stays warm white while “Havens” carries the compact gold accent.
        </p>
      </section>
      <section className="border-t pt-6">
        <h2 className="font-semibold">Trust through restraint</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Surfaces stay quiet and content remains direct. Gold is reserved for
          decisions, not decoration, so urgent housing actions are easy to find.
        </p>
        <div className="mt-5">
          <Guidelines
            items={[
              { kind: 'do', text: 'Keep the wordmark compact with tight tracking and strong weight.' },
              { kind: 'do', text: 'Use warm off-white for primary reading text and muted gray for supporting copy.' },
              { kind: 'dont', text: 'Redraw or replace the text wordmark with an invented logo asset.' },
            ]}
          />
        </div>
      </section>
    </div>
  );
}

export function ColorsPage() {
  return (
    <div className="space-y-8 rounded-xl border bg-card p-6 text-card-foreground">
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">Core palette</h2>
          <p className="text-sm text-muted-foreground">
            One gold, two quiet supporting surfaces, and no competing accent.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CORE_SWATCHES.map((swatch) => <Swatch key={swatch.name} {...swatch} />)}
        </div>
      </section>
      <section className="space-y-4 border-t pt-6">
        <div>
          <h2 className="font-semibold">Supporting roles</h2>
          <p className="text-sm text-muted-foreground">
            Surface, text, border, and danger roles complete both theme modes.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {SUPPORTING_SWATCHES.map((swatch) => <Swatch key={swatch.name} {...swatch} />)}
        </div>
      </section>
      <section className="border-t pt-6">
        <Guidelines
          items={[
            { kind: 'do', text: 'Use primary gold for buttons, links, small uppercase labels, pill borders, active states, focus rings, and thin dividers.' },
            { kind: 'do', text: 'Use the three text levels: foreground, muted-foreground, and tertiary gray.' },
            { kind: 'dont', text: 'Hardcode hex colors in components or add opacity-based text colors.' },
            { kind: 'dont', text: 'Use gold on headlines larger than 24px, section fills, large shapes, or body copy.' },
          ]}
        />
      </section>
    </div>
  );
}

export function FontsPage() {
  const samples = [
    ['Hero', 'text-5xl font-extrabold tracking-tight', 'Request emergency housing'],
    ['Heading', 'text-2xl font-bold tracking-tight', 'A clear path forward'],
    ['Body', 'text-base leading-7', 'Furnished housing when a family needs it most.'],
    ['Label', 'text-sm font-semibold uppercase tracking-[0.14em]', 'Common questions'],
    ['Caption', 'text-sm text-muted-foreground', 'Available across 48 states'],
  ] as const;
  return (
    <div className="space-y-8 rounded-xl border bg-card p-6 text-card-foreground">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Plus Jakarta Sans
        </p>
        <p className="mt-4 text-4xl font-extrabold tracking-tight">The quick brown fox</p>
        <p className="mt-2 text-sm text-muted-foreground">
          The source loads Plus Jakarta Sans for UI, headings, body copy, and labels.
        </p>
      </section>
      <section className="space-y-5 border-t pt-6">
        {samples.map(([label, className, text]) => (
          <div key={label} className="grid gap-2 sm:grid-cols-[88px_1fr]">
            <span className="pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </span>
            <p className={className}>{text}</p>
          </div>
        ))}
      </section>
      <Guidelines
        items={[
          { kind: 'do', text: 'Use size and weight to create hierarchy; large type remains foreground-colored.' },
          { kind: 'do', text: 'Reserve uppercase tracking for compact eyebrows, labels, and navigation cues.' },
        ]}
      />
    </div>
  );
}

export function LayoutPage() {
  const spacing = [
    ['4', 'w-4'],
    ['8', 'w-8'],
    ['12', 'w-12'],
    ['16', 'w-16'],
    ['24', 'w-24'],
  ] as const;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border bg-card p-6 text-card-foreground">
        <h2 className="font-semibold">4px spacing rhythm</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The base spacing token is 0.25rem; common layout gaps multiply it.
        </p>
        <div className="mt-6 space-y-4">
          {spacing.map(([label, width]) => (
            <div key={label} className="flex items-center gap-4">
              <span className="w-8 text-xs text-muted-foreground">{label}</span>
              <div className={`h-3 rounded-full bg-primary ${width}`} />
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-xl border bg-card p-6 text-card-foreground">
        <h2 className="font-semibold">Rounded, not soft</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cards use a 16px base radius; controls derive smaller steps from it.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {[
            ['Small', 'rounded-sm'],
            ['Medium', 'rounded-md'],
            ['Large', 'rounded-lg'],
            ['Extra large', 'rounded-xl'],
          ].map(([label, radius]) => (
            <div key={label} className={`flex h-24 items-end border bg-muted p-3 ${radius}`}>
              <span className="text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-xl border bg-card p-6 text-card-foreground lg:col-span-2">
        <h2 className="font-semibold">Content-width hierarchy</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Use named containers rather than one-off widths: site 1200px, section
          1100px, content 900px, prose-wide 800px, prose 760px, and CTA 420px.
        </p>
        <div className="mt-6 h-3 max-w-full rounded-full bg-primary" />
        <div className="mt-2 h-3 max-w-[91.67%] rounded-full bg-secondary" />
        <div className="mt-2 h-3 max-w-[75%] rounded-full bg-muted" />
      </section>
    </div>
  );
}