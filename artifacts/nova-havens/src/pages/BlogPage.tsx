import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { BLOG_POSTS, BLOG_FILTERS } from '@/data/blogPosts';

// hint: Logic changed on both sides. Requires understanding intent of each change.
export default function BlogPage() {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filteredPosts = BLOG_POSTS.filter(
    (post) => activeFilter === 'All' || post.category === activeFilter,
  );

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="bg-background pt-24 pb-16 px-4 md:px-8 border-b border-white/10">
        <div className="mx-auto max-w-[1200px] w-full text-center">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6"
            data-testid="heading-blog-hero"
          >
            Insights &amp; Resources
          </h1>
          <p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            data-testid="text-blog-subtitle"
          >
            Industry knowledge for insurance professionals, displaced families, and property owners.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {BLOG_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors border ${
                activeFilter === filter
                  ? 'bg-primary text-[#0A0C10] border-primary hover:brightness-105'
                  : 'bg-transparent text-muted-foreground border-white/10 hover:border-white/20'
              }`}
              data-testid={`btn-filter-${filter.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-card rounded-[16px] border border-white/[0.08] p-6 md:p-8 flex flex-col hover:border-white/20 transition-colors"
              data-testid={`card-post-${post.id}`}
            >
              <div className="mb-4">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F2CD6B]/10 text-[#F2CD6B]"
                  data-testid={`tag-category-${post.id}`}
                >
                  {post.category}
                </span>
              </div>
              <h2
                className="text-xl font-bold text-foreground mb-3 leading-tight"
                data-testid={`heading-post-${post.id}`}
              >
                {post.title}
              </h2>
              <p
                className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1"
                data-testid={`text-excerpt-${post.id}`}
              >
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/[0.06]">
                <span className="text-xs text-muted-foreground" data-testid={`text-date-${post.id}`}>
                  {post.date}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-primary text-sm font-semibold hover:underline inline-flex items-center gap-1"
                  data-testid={`link-read-more-${post.id}`}
                  aria-label={`Read more about ${post.title}`}
                >
                  Read More
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground" data-testid="text-no-posts">
            No posts found for this category.
          </div>
        )}
      </section>
    </div>
  );
}
