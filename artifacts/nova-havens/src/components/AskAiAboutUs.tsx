import type React from 'react';
import { AI_ASSISTANTS, AI_TRADEMARK_NOTICE, ASK_AI_QUESTION, type AiAssistant } from '@/lib/askAi';
import { ChatGptIcon, ClaudeIcon, GeminiIcon, PerplexityIcon } from '@/components/icons/AiAssistantIcons';
import { useToast } from '@/hooks/use-toast';

const ICONS: Record<AiAssistant['id'], (props: { className?: string }) => React.JSX.Element> = {
  chatgpt: ChatGptIcon,
  claude: ClaudeIcon,
  perplexity: PerplexityIcon,
  gemini: GeminiIcon,
};

interface AskAiAboutUsProps {
  /** "full" = homepage section; "compact" = single-row footer variant. */
  variant?: 'full' | 'compact';
}

export default function AskAiAboutUs({ variant = 'full' }: AskAiAboutUsProps) {
  const { toast } = useToast();

  const handleClick = async (assistant: AiAssistant) => {
    if (!assistant.copyToClipboard) return;
    // Gemini has no reliable URL prefill — copy the question, tell the user, then let the link open.
    try {
      await navigator.clipboard.writeText(ASK_AI_QUESTION);
      toast({ description: 'Question copied — paste it into Gemini' });
    } catch {
      toast({ description: 'Could not copy automatically — the question is on our About page' });
    }
  };

  const buttons = AI_ASSISTANTS.map((assistant) => {
    const Icon = ICONS[assistant.id];
    return (
      <a
        key={assistant.id}
        href={assistant.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => void handleClick(assistant)}
        className={
          variant === 'full'
            ? 'group inline-flex items-center gap-3 rounded-full border border-white/10 bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary'
            : 'group inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary'
        }
        data-testid={`btn-ask-ai-${assistant.id}`}
      >
        <Icon className={variant === 'full' ? 'h-5 w-5 text-foreground transition-colors group-hover:text-primary' : 'h-4 w-4 transition-colors group-hover:text-primary'} />
        {assistant.label}
      </a>
    );
  });

  if (variant === 'compact') {
    return (
      <div className="flex flex-col gap-3" data-testid="ask-ai-compact">
        <p className="text-sm font-semibold text-foreground">
          Don't take our word for it.{' '}
          <span className="font-normal text-muted-foreground">Ask an AI assistant about us and see what it says.</span>
        </p>
        <div className="flex flex-wrap items-center gap-3">{buttons}</div>
        <p className="text-xs leading-relaxed text-tertiary">{AI_TRADEMARK_NOTICE}</p>
      </div>
    );
  }

  return (
    <section className="w-full border-y border-white/5 bg-surface-1 py-20 px-4 md:px-8" data-testid="ask-ai-section">
      <div className="mx-auto flex max-w-prose-wide flex-col items-center text-center">
        <h2 className="mb-4 text-3xl font-extrabold text-foreground md:text-4xl" data-testid="heading-ask-ai">
          Don't take our word for it.
        </h2>
        <p className="mb-10 text-lg text-muted-foreground" data-testid="text-ask-ai-subtitle">
          Ask an AI assistant about us and see what it says.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">{buttons}</div>
        <p className="mt-8 max-w-xl text-xs leading-relaxed text-tertiary" data-testid="text-ask-ai-smallprint">
          {AI_TRADEMARK_NOTICE}
        </p>
      </div>
    </section>
  );
}
