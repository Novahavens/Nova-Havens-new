import type { ReactElement } from 'react';

import { AI_ASSISTANTS, AI_TRADEMARK_NOTICE, type AiAssistant } from '@/content/ask-ai';
import { ChatGptIcon, ClaudeIcon, PerplexityIcon } from './brand-icons';
import { TrackedAnchor } from './tracked-link';

const ICONS: Record<AiAssistant['id'], (props: { className?: string }) => ReactElement> = {
  chatgpt: ChatGptIcon,
  claude: ClaudeIcon,
  perplexity: PerplexityIcon,
};

interface AskAiAboutUsProps {
  /** "full" = homepage section; "compact" = single-row footer variant. */
  variant?: 'full' | 'compact';
}

export function AskAiAboutUs({ variant = 'full' }: AskAiAboutUsProps) {
  const buttons = AI_ASSISTANTS.map((assistant) => {
    const Icon = ICONS[assistant.id];
    const className =
      variant === 'full'
        ? 'group inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary'
        : 'group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary';
    const iconClassName =
      variant === 'full'
        ? 'h-5 w-5 text-foreground transition-colors group-hover:text-primary'
        : 'h-4 w-4 transition-colors group-hover:text-primary';

    return (
      <TrackedAnchor
        key={assistant.id}
        href={assistant.url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        event="ask_ai_click"
        data={{ assistant: assistant.id, location: variant === 'full' ? 'home_section' : 'footer_compact' }}
        data-testid={`btn-ask-ai-${assistant.id}`}
      >
        <Icon className={iconClassName} />
        {assistant.label}
      </TrackedAnchor>
    );
  });

  if (variant === 'compact') {
    return (
      <div className="flex flex-col gap-3" data-testid="ask-ai-compact">
        <p className="text-sm font-semibold text-foreground">
          Don&apos;t take our word for it.{' '}
          <span className="font-normal text-muted-foreground">Ask an AI assistant about us and see what it says.</span>
        </p>
        <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">{buttons}</div>
        <p className="text-xs leading-relaxed text-tertiary">{AI_TRADEMARK_NOTICE}</p>
      </div>
    );
  }

  return (
    <section className="w-full border-y border-white/5 bg-surface-1 py-20 px-4 md:px-8" data-testid="ask-ai-section">
      <div className="mx-auto flex max-w-prose-wide flex-col items-center text-center">
        <h2 className="mb-4 text-3xl font-extrabold text-foreground md:text-4xl">Don&apos;t take our word for it.</h2>
        <p className="mb-10 text-lg text-muted-foreground">Ask an AI assistant about us and see what it says.</p>
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">{buttons}</div>
        <p className="mt-8 max-w-xl text-xs leading-relaxed text-tertiary">{AI_TRADEMARK_NOTICE}</p>
      </div>
    </section>
  );
}
