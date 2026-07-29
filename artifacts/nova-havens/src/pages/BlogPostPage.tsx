import { Fragment } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';
import { getPostBySlug } from '@/data/blogPosts';
import { EXTERNAL_FORM_LINK_PROPS, INTAKE_FORMS } from '@/lib/intakeForms';

// ---------------------------------------------------------------------------
// Inline text renderer: handles **bold** and *italic* markers
// ---------------------------------------------------------------------------
function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i} className="italic">{part.slice(1, -1)}</em>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Block renderer: handles paragraphs, headings (##/###/**), bullet lists,
// numbered lists, blockquotes (> text), and mixed intro+list blocks
// ---------------------------------------------------------------------------
function renderContent(text: string) {
  const blocks = text.split(/\n\n+/);

  return blocks.map((block, blockIdx) => {
    const lines = block.split('\n');

    // ── ## H2 heading
    if (lines.length === 1 && block.startsWith('## ')) {
      return (
        <h2 key={blockIdx} className="text-xl font-bold text-foreground mt-10 mb-3">
          {block.slice(3)}
        </h2>
      );
    }

    // ── ### H3 heading
    if (lines.length === 1 && block.startsWith('### ')) {
      return (
        <h3 key={blockIdx} className="text-lg font-semibold text-foreground mt-7 mb-2">
          {block.slice(4)}
        </h3>
      );
    }

    // ── Blockquote / direct-answer box  (> text)
    if (lines.every(l => l.startsWith('> '))) {
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

    // ── Pure heading block: **Heading** alone on one line
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

    // ── Heading block: **Heading** on first line, body on rest
    if (lines[0].startsWith('**') && lines[0].endsWith('**')) {
      const heading = lines[0].slice(2, -2);
      const body = lines.slice(1).join('\n').trim();
      return (
        <div key={blockIdx} className="mb-5">
          <h3 className="text-lg font-bold text-foreground mb-2">{heading}</h3>
          {body && (
            <p className="text-muted-foreground leading-[1.8]">
              <InlineText text={body} />
            </p>
          )}
        </div>
      );
    }

    // ── Detect if block contains numbered list items (1. / 2. etc.)
    const firstNumIdx = lines.findIndex(l => /^\d+\.\s/.test(l));
    const firstBulletIdx = lines.findIndex(l => l.startsWith('- '));

    // ── Pure numbered list (possibly with intro)
    if (firstNumIdx !== -1 && (firstBulletIdx === -1 || firstNumIdx <= firstBulletIdx)) {
      const introLines = lines.slice(0, firstNumIdx);
      const numLines = lines.slice(firstNumIdx).filter(l => /^\d+\.\s/.test(l));
      return (
        <div key={blockIdx} className="mb-5">
          {introLines.length > 0 && (
            <p className="text-muted-foreground leading-[1.8] mb-3">
              <InlineText text={introLines.join('\n')} />
            </p>
          )}
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-[1.8]">
            {numLines.map((item, j) => (
              <li key={j} className="pl-1">
                <InlineText text={item.replace(/^\d+\.\s/, '')} />
              </li>
            ))}
          </ol>
        </div>
      );
    }

    // ── No bullets → plain paragraph
    if (firstBulletIdx === -1) {
      return (
        <p key={blockIdx} className="text-muted-foreground leading-[1.8] mb-5">
          <InlineText text={block} />
        </p>
      );
    }

    // ── Has bullets: may also have intro text before the first bullet
    const introLines = lines.slice(0, firstBulletIdx);
    const bulletLines = lines.slice(firstBulletIdx).filter(l => l.startsWith('- '));

    return (
      <div key={blockIdx} className="mb-5">
        {introLines.length > 0 && (
          <p className="text-muted-foreground leading-[1.8] mb-3">
            <InlineText text={introLines.join('\n')} />
          </p>
        )}
        <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-[1.8]">
          {bulletLines.map((item, j) => (
            <li key={j}>
              <InlineText text={item.slice(2)} />
            </li>
          ))}
        </ul>
      </div>
    );
  });
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = getPostBySlug(slug ?? '');

  if (!post) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-8">This article doesn't exist or may have moved.</p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          data-testid="link-back-to-blog"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="bg-background pt-24 pb-12 px-4 md:px-8 border-b border-white/10">
        <div className="mx-auto max-w-[760px] w-full">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
            data-testid="link-back-to-blog"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary"
              data-testid="tag-post-category"
            >
              <Tag className="w-3 h-3" />
              {post.category}
            </span>
            <span
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
              data-testid="text-post-date"
            >
              <Calendar className="w-3 h-3" />
              {post.date}
            </span>
          </div>

          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight mb-6"
            data-testid="heading-post-title"
          >
            {post.title}
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed mb-6" data-testid="text-post-excerpt">
            {post.excerpt}
          </p>

          {post.author && (
            <div
              className="flex items-center gap-2 text-sm text-muted-foreground border-t border-white/10 pt-5"
              data-testid="text-post-author"
            >
              <User className="w-4 h-4 text-primary shrink-0" />
              <span>
                <span className="text-foreground font-medium">{post.author.name}</span>
                {', '}
                <span>{post.author.role}</span>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Article body */}
      <section className="py-12 px-4 md:px-8">
        <div className="mx-auto max-w-[760px] w-full">
          <article className="text-base" data-testid="article-body">
            {renderContent(post.content)}
          </article>

          {/* Closing CTA */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div
              className="bg-card rounded-[16px] border border-white/[0.08] p-8 text-center"
              data-testid="card-post-cta"
            >
              <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-3">Nova Havens</p>
              <h2 className="text-2xl font-bold text-foreground mb-3">Need housing assistance now?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Our team is available 24/7 for emergency claims and placements nationwide.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={INTAKE_FORMS.housing}
                  {...EXTERNAL_FORM_LINK_PROPS}
                  className="px-7 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:brightness-105 transition-all"
                  data-testid="btn-request-housing-cta"
                >
                  Request Housing
                </a>
                <a
                  href="tel:+16294010054"
                  className="px-7 py-3 rounded-full border border-primary text-primary font-bold text-sm hover:bg-primary/10 transition-all"
                  data-testid="link-call-cta"
                >
                  (629) 401-0054
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
              data-testid="link-more-articles"
            >
              <ArrowLeft className="w-4 h-4" />
              More articles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
