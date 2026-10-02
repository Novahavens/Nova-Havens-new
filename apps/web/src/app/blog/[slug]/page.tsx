import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';

import { PostBody } from '@/components/blog/post-body';
import { IntakeCta } from '@/components/shared/cta-button';
import { JsonLd } from '@/components/shared/json-ld';
import { TrackedAnchor } from '@/components/shared/tracked-link';
import { CONTACT } from '@/config/site';
import { getAllPostSlugs, getPostBySlug } from '@/content/source';
import { blogPostImage, blogPostSchema, pageMetadata } from '@/lib/seo';

type Params = { slug: string };

/** Every post is pre-rendered at build; unknown slugs 404. */
export const dynamicParams = false;

export async function generateStaticParams(): Promise<Params[]> {
  return (await getAllPostSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const base = pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: 'article',
    image: blogPostImage(post),
  });
  return {
    ...base,
    keywords: post.keywords,
    openGraph: {
      ...base.openGraph,
      type: 'article',
      publishedTime: post.dateISO,
      modifiedTime: post.dateISO,
      section: post.category,
      tags: post.keywords,
      authors: post.author ? [post.author.name] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const ctaIsProperty = post.cta === 'property';

  return (
    <div className="w-full">
      <JsonLd data={blogPostSchema(post)} />

      <section className="bg-background pt-24 pb-12 px-4 md:px-8 border-b border-white/10">
        <div className="mx-auto max-w-prose w-full">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
            data-testid="link-back-to-blog"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              <Tag className="w-3 h-3" aria-hidden="true" />
              {post.category}
            </span>
            <time dateTime={post.dateISO} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" aria-hidden="true" />
              {post.date}
            </time>
          </div>
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight mb-6"
            data-testid="heading-post-title"
          >
            {post.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">{post.excerpt}</p>
          {post.author ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-white/10 pt-5">
              <User className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <span>
                <span className="text-foreground font-medium">{post.author.name}</span>, <span>{post.author.role}</span>
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="py-12 px-4 md:px-8">
        <div className="mx-auto max-w-prose w-full">
          <article className="text-base" data-testid="article-body">
            <PostBody content={post.content} />
          </article>

          {post.cta !== 'none' ? (
            <div className="mt-12 pt-8 border-t border-white/10">
              <div
                className="bg-card rounded-lg border border-white/[0.08] p-8 text-center"
                data-testid="card-post-cta"
              >
                <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-3">Nova Havens</p>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  {ctaIsProperty ? 'Own a furnished property?' : 'Need housing assistance now?'}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {ctaIsProperty
                    ? 'Join the Nova Havens network and host insurance-displaced families in your area.'
                    : 'Our team is available 24/7 for emergency claims and placements nationwide.'}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <IntakeCta form={ctaIsProperty ? 'property' : 'housing'} location="blog_post_cta" size="sm">
                    {ctaIsProperty ? 'Submit your property' : 'Submit a housing request'}
                  </IntakeCta>
                  <TrackedAnchor
                    href={CONTACT.phone.href}
                    event="contact_link_click"
                    data={{ method: 'phone', location: 'blog_post_cta' }}
                    className="px-7 py-3 rounded-full border border-primary text-primary font-bold text-sm hover:bg-primary/10 transition-all"
                  >
                    {CONTACT.phone.display}
                  </TrackedAnchor>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-8 text-center">
            <Link href="/blog" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              More articles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
