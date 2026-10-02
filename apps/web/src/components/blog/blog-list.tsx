'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

import { BLOG_FILTERS, type BlogPost } from '@/content/blog';
import { trackEvent } from '@/lib/analytics';

type Filter = (typeof BLOG_FILTERS)[number];

/**
 * Category filter + post grid. The full post list arrives from the server so
 * every card is in the HTML; filtering is a tiny client-side toggle.
 */
export function BlogList({ posts }: { posts: BlogPost[] }) {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const filtered = posts.filter((post) => activeFilter === 'All' || post.category === activeFilter);

  return (
    <>
      <div
        className="flex flex-wrap items-center justify-center gap-3 mb-12"
        role="group"
        aria-label="Filter articles by category"
      >
        {BLOG_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            aria-pressed={activeFilter === filter}
            onClick={() => {
              if (filter !== activeFilter) trackEvent('blog_filter_selected', { filter });
              setActiveFilter(filter);
            }}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border ${
              activeFilter === filter
                ? 'bg-primary text-primary-foreground border-primary hover:brightness-105'
                : 'bg-transparent text-muted-foreground border-white/10 hover:border-white/20'
            }`}
            data-testid={`btn-filter-${filter.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((post) => (
          <article
            key={post.slug}
            className="bg-card rounded-lg border border-white/[0.08] p-6 md:p-8 flex flex-col hover:border-white/20 transition-colors"
            data-testid={`card-post-${post.id}`}
          >
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                {post.category}
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3 leading-tight">
              <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                {post.title}
              </Link>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">{post.excerpt}</p>
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/[0.06]">
              <time dateTime={post.dateISO} className="text-xs text-muted-foreground">
                {post.date}
              </time>
              <Link
                href={`/blog/${post.slug}`}
                className="text-primary text-sm font-semibold hover:underline inline-flex items-center gap-1"
                aria-label={`Read more about ${post.title}`}
                data-testid={`link-read-more-${post.id}`}
              >
                Read More
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-20 text-muted-foreground" data-testid="text-no-posts">
          No posts found for this category.
        </p>
      ) : null}
    </>
  );
}
