import { useEffect, Fragment } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { getPostBySlug } from '@/data/blogPosts';

// ---------------------------------------------------------------------------
// Inline text renderer: handles **bold** and *italic* markers
// ---------------------------------------------------------------------------
function InlineText({ text }: { text: string }) {
  // Split on **bold** and *italic* markers
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
// Block renderer: handles paragraphs, bullet lists, and mixed blocks
// (intro text followed by bullets in the same double-newline block)
// ---------------------------------------------------------------------------
function renderContent(text: string) {
  const blocks = text.split(/\n\n+/);

  return blocks.map((block, blockIdx) => {
    const lines = block.split('\n');
    const firstBulletIdx = lines.findIndex(l => l.startsWith('- '));

    // ── Pure heading block: first line is **Heading** with no following body
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

    // ── Heading block: **Heading** on first line, body text on rest
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

    // ── No bullets at all → plain paragraph
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

  useEffect(() => {
    if (post) {
      // Title/description/OG tags are applied centrally by useRouteMeta (App.tsx).
      // Inject BlogPosting structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'jsonld-blogpost';
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "datePublished": post.dateISO,
        "dateModified": post.dateISO,
        "url": `https://novahavens.com/blog/${post.slug}`,
        "author": {
          "@type": "Organization",
          "@id": "https://novahavens.com/#organization",
          "name": "Nova Havens"
        },
        "publisher": {
          "@type": "Organization",
          "@id": "https://novahavens.com/#organization",
          "name": "Nova Havens"
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://novahavens.com/blog/${post.slug}`
        },
        "articleSection": post.category,
        "isPartOf": {
          "@id": "https://novahavens.com/#website"
        }
      });
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById('jsonld-blogpost')?.remove();
    };
  }, [post]);

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
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F2CD6B]/10 text-[#F2CD6B]"
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

          <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-post-excerpt">
            {post.excerpt}
          </p>
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
              className="bg-[#111318] rounded-[16px] border border-white/[0.08] p-8 text-center"
              data-testid="card-post-cta"
            >
              <p className="text-sm uppercase tracking-widest text-[#D4A24C] font-semibold mb-3">Nova Havens</p>
              <h2 className="text-2xl font-bold text-foreground mb-3">Need housing assistance now?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Our team is available 24/7 for emergency claims and placements nationwide.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="#"
                  className="px-7 py-3 rounded-full bg-[#D4A24C] text-[#0A0C10] font-bold text-sm hover:brightness-105 transition-all"
                  data-testid="btn-request-housing-cta"
                >
                  Request Housing
                </a>
                <a
                  href="tel:+16294010054"
                  className="px-7 py-3 rounded-full border border-[#D4A24C] text-[#D4A24C] font-bold text-sm hover:bg-[#D4A24C]/10 transition-all"
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
