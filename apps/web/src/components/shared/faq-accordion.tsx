'use client';

import { ChevronDown } from 'lucide-react';

import type { FaqGroup } from '@/content/faqs';
import { trackEvent } from '@/lib/analytics';

interface FaqAccordionProps {
  groups: FaqGroup[];
  /** `{page}_{section}` for the analytics event. */
  location: string;
  testIdPrefix?: string;
}

/**
 * FAQ list built on native <details>/<summary>: every answer is in the HTML
 * for crawlers, it works without JavaScript, and the only client code is the
 * analytics hook that fires when an item is opened.
 */
export function FaqAccordion({ groups, location, testIdPrefix = 'faq' }: FaqAccordionProps) {
  return (
    <div className="space-y-10">
      {groups.map((group, groupIdx) => {
        const offset = groups.slice(0, groupIdx).reduce((total, g) => total + g.items.length, 0);
        return (
          <div key={group.id} className="space-y-4" data-testid={`${testIdPrefix}-group-${group.id}`}>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">{group.heading}</h3>
            <div className="space-y-3">
              {group.items.map((item, itemIdx) => {
                const runningIndex = offset + itemIdx + 1;
                return (
                  <details
                    key={item.question}
                    className="faq-item bg-card rounded-lg border border-white/10 overflow-hidden"
                    data-testid={`${testIdPrefix}-item-${runningIndex}`}
                    onToggle={(event) => {
                      if (event.currentTarget.open) trackEvent('faq_expanded', { question: item.question, location });
                    }}
                  >
                    <summary className="w-full flex items-center justify-between p-6 text-left gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors">
                      <span className="font-semibold text-foreground text-base leading-snug">{item.question}</span>
                      <ChevronDown
                        className="faq-chevron w-5 h-5 text-primary flex-shrink-0 transition-transform duration-200"
                        aria-hidden="true"
                      />
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed text-sm md:text-base">
                      {item.answer}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
