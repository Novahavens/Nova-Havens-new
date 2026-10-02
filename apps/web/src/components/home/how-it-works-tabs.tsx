'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { HowItWorksTrack } from '@/content/how-it-works';

export function HowItWorksTabs({ tracks }: { tracks: HowItWorksTrack[] }) {
  return (
    <Tabs defaultValue={tracks[0]?.id} className="w-full flex flex-col items-center">
      <TabsList
        className="bg-card border border-white/10 p-1 rounded-full h-auto flex flex-col sm:flex-row w-full sm:w-auto mb-12"
        data-testid="tabs-how-it-works"
      >
        {tracks.map((track) => (
          <TabsTrigger
            key={track.id}
            value={track.id}
            className="rounded-full px-6 py-3 text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full sm:w-auto"
            data-testid={`tab-${track.id}`}
          >
            {track.tabLabel}
          </TabsTrigger>
        ))}
      </TabsList>

      {tracks.map((track) => (
        <TabsContent
          key={track.id}
          value={track.id}
          className="w-full mt-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <h3 className="sr-only">{track.heading}</h3>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 relative list-none p-0 m-0">
            <div
              className="hidden md:block absolute top-6 left-[16.66%] right-[16.66%] h-px bg-primary/30 z-0"
              aria-hidden="true"
            />
            {track.steps.map((step, idx) => (
              <li
                key={step.name}
                className="flex flex-col items-center text-center relative z-10 bg-background pt-0 px-4"
                data-testid={`step-${track.id}-${idx + 1}`}
              >
                <div
                  className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-[var(--shadow-glow-sm)]"
                  aria-hidden="true"
                >
                  {idx + 1}
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">{step.name}</h4>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{step.text}</p>
              </li>
            ))}
          </ol>
        </TabsContent>
      ))}
    </Tabs>
  );
}
