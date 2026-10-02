import { buildCoverageMapSvg } from '@/lib/us-map';

/** /maps/coverage-detailed.svg — generated at build from US Census geometry + the latest property snapshot. */
export const dynamic = 'force-static';

export function GET() {
  return new Response(buildCoverageMapSvg('detailed'), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
