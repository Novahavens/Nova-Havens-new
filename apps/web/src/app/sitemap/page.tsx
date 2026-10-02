import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';

import { JsonLd } from '@/components/shared/json-ld';
import { MACHINE_READABLE_FILES, SITE_PAGES } from '@/config/routes';
import { COMPANY } from '@/config/site';
import { getAllPosts } from '@/content/source';
import { graph, pageMetadata, webPageSchema } from '@/lib/seo';

const DESCRIPTION = `A complete list of every page on ${COMPANY.name}'s website: housing coordination services, the team, the blog, contact routes, and machine-readable resources.`;

export const metadata: Metadata = pageMetadata({ title: 'Site Map', description: DESCRIPTION, path: '/sitemap' });

const GROUPS = ['Main', 'Resources', 'Legal & machine-readable'] as const;

/**
 * Human-readable site map. Complements /sitemap.xml: it gives visitors a
 * single index, gives crawlers one more internal link to every URL, and is
 * generated from the same registry so it cannot drift.
 */
export default async function SiteMapPage() {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto max-w-prose-wide w-full px-4 md:px-8 py-20 pb-32">
      <JsonLd
        data={graph(
          webPageSchema({ type: 'CollectionPage', path: '/sitemap', name: 'Site Map', description: DESCRIPTION }),
        )}
      />

      <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-4">Site Map</p>
      <h1
        className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4"
        data-testid="heading-sitemap"
      >
        Every page on novahavens.com
      </h1>
      <p className="text-muted-foreground mb-12 leading-relaxed">{DESCRIPTION}</p>

      <div className="space-y-12">
        {GROUPS.map((group) => (
          <section key={group} aria-labelledby={`group-${group.toLowerCase().replace(/[^a-z]+/g, '-')}`}>
            <h2
              id={`group-${group.toLowerCase().replace(/[^a-z]+/g, '-')}`}
              className="text-2xl font-bold text-primary mb-6 pb-3 border-b border-white/10"
            >
              {group}
            </h2>
            <ul className="space-y-3">
              {SITE_PAGES.filter((page) => page.group === group).map((page) => (
                <li key={page.path} className="bg-card rounded-lg border border-white/[0.08] p-5">
                  <Link
                    href={page.path}
                    className="group inline-flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {page.label}
                    <ArrowRight
                      className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-hidden="true"
                    />
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">{page.description}</p>
                  <p className="text-xs text-tertiary mt-2 font-mono">{page.path}</p>
                </li>
              ))}
              {group === 'Resources'
                ? posts.map((post) => (
                    <li key={post.slug} className="bg-card rounded-lg border border-white/[0.08] p-5 ml-0 md:ml-8">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group inline-flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {post.title}
                        <ArrowRight
                          className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-hidden="true"
                        />
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {post.category} · <time dateTime={post.dateISO}>{post.date}</time>
                      </p>
                      <p className="text-xs text-tertiary mt-2 font-mono">/blog/{post.slug}</p>
                    </li>
                  ))
                : null}
              {group === 'Legal & machine-readable'
                ? MACHINE_READABLE_FILES.map((file) => (
                    <li key={file.path} className="bg-card rounded-lg border border-white/[0.08] p-5">
                      <a
                        href={file.path}
                        className="inline-flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors font-mono text-sm"
                      >
                        <FileText className="w-4 h-4 text-primary" aria-hidden="true" />
                        {file.label}
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">{file.description}</p>
                    </li>
                  ))
                : null}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
