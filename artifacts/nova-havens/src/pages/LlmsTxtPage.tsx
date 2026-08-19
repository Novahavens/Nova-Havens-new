import React from 'react';
import {
  LLMS_TXT_PAGE_INTRO,
  LLMS_TXT_PAGE_TITLE,
  LLMS_TXT_SECTIONS,
} from '@/data/llmsContent';

function renderMarkdownLine(line: string, idx: number) {
  // Bold: **text**
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match;
  const text = line;
  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(<strong key={match.index} className="text-foreground font-semibold">{match[1]}</strong>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <React.Fragment key={idx}>{parts}</React.Fragment>;
}

function ProseBlock({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-2 text-muted-foreground leading-relaxed text-sm md:text-base">
      {lines.map((line, idx) => {
        if (line.startsWith('- ')) {
          return (
            <div key={idx} className="flex gap-2">
              <span className="text-primary mt-1 shrink-0">·</span>
              <span>{renderMarkdownLine(line.slice(2), idx)}</span>
            </div>
          );
        }
        if (line === '') return <div key={idx} className="h-2" />;
        return <p key={idx}>{renderMarkdownLine(line, idx)}</p>;
      })}
    </div>
  );
}

export default function LlmsTxtPage() {
  return (
    <div className="mx-auto max-w-prose-wide w-full px-4 md:px-8 py-12 md:py-20 pb-20 md:pb-32">
      {/* Top banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 md:p-6 mb-8 md:mb-12" data-testid="banner-llms-txt">
        <p className="text-sm leading-relaxed text-muted-foreground">
          This page is a human-readable version of the{' '}
          <a
            href="/llms.txt"
            className="text-primary hover:underline font-medium"
            data-testid="link-raw-llms-txt"
          >
            /llms.txt
          </a>{' '}
          file — a machine-readable document that helps AI assistants understand Nova Havens,
          what we do, who we serve, and how to reach us. You can access the raw plain-text file
          directly at{' '}
          <a href="/llms.txt" className="text-primary hover:underline font-mono text-xs sm:text-sm">
            /llms.txt
          </a>
          .
        </p>
      </div>

      <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4" data-testid="heading-llms-txt">
        {LLMS_TXT_PAGE_TITLE}
      </h1>
      <p className="text-muted-foreground mb-10 md:mb-16 leading-relaxed">
        {LLMS_TXT_PAGE_INTRO}
      </p>

      <div className="space-y-14">
        {LLMS_TXT_SECTIONS.map((section) => (
          <section key={section.heading} data-testid={`section-${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
            <h2 className="text-2xl font-bold text-primary mb-6 pb-3 border-b border-white/10">
              {section.heading}
            </h2>

            {'faqs' in section && section.faqs ? (
              <div className="space-y-6">
                {section.faqs.map((faq, i) => (
                  <div key={i} className="rounded-lg bg-white/[0.03] border border-white/[0.07] p-5">
                    <p className="font-semibold text-foreground mb-2">{faq.q}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            ) : 'subsections' in section && section.subsections ? (
              <div className="space-y-8">
                {section.subsections.map((sub) => (
                  <div key={sub.subheading}>
                    <h3 className="text-lg font-semibold text-foreground mb-4">{sub.subheading}</h3>
                    <ProseBlock content={sub.content} />
                  </div>
                ))}
              </div>
            ) : 'content' in section && section.content ? (
              <ProseBlock content={section.content} />
            ) : null}
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
