import type { Metadata } from 'next';
import { Fragment } from 'react';

import { LLMS_TXT_PAGE_INTRO, LLMS_TXT_PAGE_TITLE, LLMS_TXT_SECTIONS } from '@/content/llms';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: LLMS_TXT_PAGE_TITLE,
  description:
    'A human-readable version of the Nova Havens llms.txt file — the machine-readable document that helps AI assistants understand who we are, what we do, and how to reach us.',
  path: '/llms-txt',
});

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const BOLD_RE = /\*\*(.*?)\*\*/g;

/** Renders a line of light markdown: [links](url) and **bold**. */
function InlineMarkdown({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK_RE)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(<Bold key={`t-${last}`} text={text.slice(last, index)} />);
    nodes.push(
      <a
        key={`l-${index}`}
        href={match[2]}
        className="text-primary hover:underline font-medium"
        rel={match[2]?.startsWith('http') && !match[2]?.includes('novahavens.com') ? 'noopener noreferrer' : undefined}
      >
        {match[1]}
      </a>,
    );
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(<Bold key={`t-${last}`} text={text.slice(last)} />);
  return <>{nodes}</>;
}

function Bold({ text }: { text: string }) {
  const parts = text.split(BOLD_RE);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="text-foreground font-semibold">
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function ProseBlock({ content }: { content: string }) {
  return (
    <div className="space-y-2 text-muted-foreground leading-relaxed text-sm md:text-base">
      {content.split('\n').map((line, idx) => {
        if (line.startsWith('- ')) {
          return (
            <div key={idx} className="flex gap-2">
              <span className="text-primary mt-1 shrink-0" aria-hidden="true">
                ·
              </span>
              <span>
                <InlineMarkdown text={line.slice(2)} />
              </span>
            </div>
          );
        }
        if (line === '') return <div key={idx} className="h-2" />;
        return (
          <p key={idx}>
            <InlineMarkdown text={line} />
          </p>
        );
      })}
    </div>
  );
}

export default function LlmsTxtPage() {
  return (
    <div className="mx-auto max-w-prose-wide w-full px-4 md:px-8 py-12 md:py-20 pb-20 md:pb-32">
      <div
        className="bg-primary/10 border border-primary/20 rounded-lg p-4 md:p-6 mb-8 md:mb-12"
        data-testid="banner-llms-txt"
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          This page is a human-readable version of the{' '}
          <a href="/llms.txt" className="text-primary hover:underline font-medium" data-testid="link-raw-llms-txt">
            /llms.txt
          </a>{' '}
          file — a machine-readable document that helps AI assistants understand Nova Havens, what we do, who we serve,
          and how to reach us. You can access the raw plain-text file directly at{' '}
          <a href="/llms.txt" className="text-primary hover:underline font-mono text-xs sm:text-sm">
            /llms.txt
          </a>
          .
        </p>
      </div>

      <h1
        className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4"
        data-testid="heading-llms-txt"
      >
        {LLMS_TXT_PAGE_TITLE}
      </h1>
      <p className="text-muted-foreground mb-10 md:mb-16 leading-relaxed">{LLMS_TXT_PAGE_INTRO}</p>

      <div className="space-y-14">
        {LLMS_TXT_SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl font-bold text-primary mb-6 pb-3 border-b border-white/10">{section.heading}</h2>
            <ProseBlock content={section.content} />
          </section>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-white/10">
        <p className="text-sm text-muted-foreground">
          View the raw plain-text version:{' '}
          <a href="/llms.txt" className="text-primary hover:underline font-mono text-xs">
            /llms.txt
          </a>
        </p>
      </div>
    </div>
  );
}
