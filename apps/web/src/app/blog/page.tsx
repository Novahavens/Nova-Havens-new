import type { Metadata } from 'next';

import { BlogList } from '@/components/blog/blog-list';
import { JsonLd } from '@/components/shared/json-ld';
import { getAllPosts } from '@/content/source';
import { blogIndexSchema, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Blog & Resources',
  description:
    'Nova Havens publishes guides for insurance professionals and displaced families on temporary housing, ALE coverage, and claims coordination.',
  path: '/blog',
});

export default async function BlogPage() {
  const posts = await getAllPosts();
  return (
    <div className="w-full">
      <JsonLd data={blogIndexSchema(posts)} />
      <section className="bg-background pt-24 pb-16 px-4 md:px-8 border-b border-white/10">
        <div className="mx-auto max-w-site w-full text-center">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6"
            data-testid="heading-blog-hero"
          >
            Insights &amp; Resources
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Industry knowledge for insurance professionals and displaced families.
          </p>
        </div>
      </section>
      <section className="py-12 md:py-16 px-4 md:px-8 max-w-site mx-auto w-full">
        <BlogList posts={posts} />
      </section>
    </div>
  );
}
