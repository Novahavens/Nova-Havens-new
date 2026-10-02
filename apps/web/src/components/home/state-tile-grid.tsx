import { SERVICE_AREA } from '@/config/site';

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

/** Tile-grid layout of the 48 contiguous states, arranged in a rough US shape. */
const STATE_TILE_GRID: (string | null)[][] = [
  [null, null, null, null, null, null, null, null, null, null, 'ME'],
  [null, null, null, null, null, null, null, null, null, 'VT', 'NH'],
  ['WA', 'ID', 'MT', 'ND', 'MN', 'WI', null, 'MI', 'NY', 'CT', 'MA'],
  ['OR', 'NV', 'WY', 'SD', 'IA', 'IL', 'IN', 'OH', 'PA', 'NJ', 'RI'],
  ['CA', 'UT', 'CO', 'NE', 'MO', 'KY', 'WV', 'VA', 'MD', 'DE', null],
  [null, 'AZ', 'NM', 'KS', 'AR', 'TN', 'NC', 'SC', null, null, null],
  [null, null, null, 'OK', 'LA', 'MS', 'AL', 'GA', null, null, null],
  [null, null, null, 'TX', null, null, null, 'FL', null, null, null],
];

/** The map represents the service footprint: every contiguous state is served. */
export function StateTileGrid() {
  return (
    <div
      className="w-full bg-card rounded-lg border border-white/10 mb-8 relative overflow-hidden p-6 md:p-10"
      data-testid="card-map"
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div
        className="relative flex flex-col gap-1.5 md:gap-2"
        role="img"
        aria-label={`Map of the ${SERVICE_AREA.name} with the states Nova Havens serves highlighted`}
      >
        {STATE_TILE_GRID.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-11 gap-1.5 md:gap-2">
            {row.map((code, colIdx) =>
              code ? (
                <div
                  key={code}
                  className="aspect-square rounded-sm flex items-center justify-center text-xs font-bold tracking-tight bg-primary/20 border border-primary/40 text-primary"
                  title={`${STATE_NAMES[code] ?? code} — served by Nova Havens`}
                >
                  {code}
                </div>
              ) : (
                <div key={`empty-${rowIdx}-${colIdx}`} aria-hidden="true" />
              ),
            )}
          </div>
        ))}
      </div>
      <div className="relative mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/40" aria-hidden="true" /> States served
        by Nova Havens
      </div>
    </div>
  );
}
