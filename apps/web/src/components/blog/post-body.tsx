import { Fragment, type ReactNode } from 'react';

/** Inline renderer: **bold** and *italic* markers. */
function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return (
            <strong key={i} className="text-foreground font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        if (part.startsWith('*') && part.endsWith('*'))
          return (
            <em key={i} className="italic">
              {part.slice(1, -1)}
            </em>
          );
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

/**
 * Block renderer for the lightweight post format: paragraphs, ## / ###
 * headings, **Heading** blocks, bullet and numbered lists, blockquotes, and
 * the opening "Quick summary" callout. Runs on the server.
 */
export function PostBody({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/);
  const out: ReactNode[] = blocks.map((block, blockIdx) => {
    const lines = block.split('\n');
    const first = lines[0] ?? '';

    if (lines.length === 1 && block.startsWith('## ')) {
      return (
        <h2 key={blockIdx} className="text-xl font-bold text-foreground mt-10 mb-3">
          {block.slice(3)}
        </h2>
      );
    }
    if (lines.length === 1 && block.startsWith('### ')) {
      return (
        <h3 key={blockIdx} className="text-lg font-semibold text-foreground mt-7 mb-2">
          {block.slice(4)}
        </h3>
      );
    }

    if (lines.every((l) => l.startsWith('> '))) {
      if (blockIdx === 0) {
        return (
          <div
            key={blockIdx}
            className="bg-card border border-primary/25 rounded-lg p-6 md:p-7 mb-8"
            data-testid="box-quick-summary"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Quick summary</p>
            {lines.map((l, i) => (
              <p key={i} className={`text-muted-foreground leading-[1.8] ${i > 0 ? 'mt-3' : ''}`}>
                <InlineText text={l.slice(2)} />
              </p>
            ))}
          </div>
        );
      }
      return (
        <blockquote
          key={blockIdx}
          className="border-l-4 border-primary bg-primary/5 rounded-r-lg px-5 py-4 mb-6 text-muted-foreground leading-[1.8] italic"
        >
          {lines.map((l, i) => (
            <p key={i} className={i > 0 ? 'mt-2' : ''}>
              <InlineText text={l.slice(2)} />
            </p>
          ))}
        </blockquote>
      );
    }

    if (
      lines.length === 1 &&
      block.startsWith('**') &&
      block.endsWith('**') &&
      block.indexOf('**', 2) === block.length - 2
    ) {
      return (
        <h3 key={blockIdx} className="text-lg font-bold text-foreground mt-8 mb-2">
          {block.slice(2, -2)}
        </h3>
      );
    }

    if (first.startsWith('**') && first.endsWith('**')) {
      const body = lines.slice(1).join('\n').trim();
      return (
        <div key={blockIdx} className="mb-5">
          <h3 className="text-lg font-bold text-foreground mb-2">{first.slice(2, -2)}</h3>
          {body ? (
            <p className="text-muted-foreground leading-[1.8]">
              <InlineText text={body} />
            </p>
          ) : null}
        </div>
      );
    }

    const firstNumIdx = lines.findIndex((l) => /^\d+\.\s/.test(l));
    const firstBulletIdx = lines.findIndex((l) => l.startsWith('- '));

    if (firstNumIdx !== -1 && (firstBulletIdx === -1 || firstNumIdx <= firstBulletIdx)) {
      const intro = lines.slice(0, firstNumIdx);
      const items = lines.slice(firstNumIdx).filter((l) => /^\d+\.\s/.test(l));
      return (
        <div key={blockIdx} className="mb-5">
          {intro.length > 0 ? (
            <p className="text-muted-foreground leading-[1.8] mb-3">
              <InlineText text={intro.join('\n')} />
            </p>
          ) : null}
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-[1.8]">
            {items.map((item, j) => (
              <li key={j} className="pl-1">
                <InlineText text={item.replace(/^\d+\.\s/, '')} />
              </li>
            ))}
          </ol>
        </div>
      );
    }

    if (firstBulletIdx === -1) {
      return (
        <p key={blockIdx} className="text-muted-foreground leading-[1.8] mb-5">
          <InlineText text={block} />
        </p>
      );
    }

    const intro = lines.slice(0, firstBulletIdx);
    const bullets = lines.slice(firstBulletIdx).filter((l) => l.startsWith('- '));
    return (
      <div key={blockIdx} className="mb-5">
        {intro.length > 0 ? (
          <p className="text-muted-foreground leading-[1.8] mb-3">
            <InlineText text={intro.join('\n')} />
          </p>
        ) : null}
        <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-[1.8]">
          {bullets.map((item, j) => (
            <li key={j}>
              <InlineText text={item.slice(2)} />
            </li>
          ))}
        </ul>
      </div>
    );
  });
  return <>{out}</>;
}
