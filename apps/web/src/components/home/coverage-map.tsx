/**
 * Decorative US map filled with property pins. Pure SVG, rendered on the
 * server — no JavaScript shipped for it.
 */
const PROPERTY_DOT_POINTS = Array.from({ length: 8 }, (_, row) =>
  Array.from({ length: 24 }, (_, column) => ({ x: 55 + column * 29 + (row % 2) * 4, y: 82 + row * 31 })),
).flat();

const FEATURED_PROPERTY_PINS = [
  [84, 105],
  [139, 96],
  [199, 98],
  [264, 100],
  [327, 102],
  [383, 116],
  [443, 126],
  [510, 140],
  [574, 157],
  [642, 179],
  [702, 192],
  [114, 138],
  [174, 137],
  [235, 140],
  [294, 141],
  [352, 151],
  [414, 159],
  [477, 170],
  [542, 178],
  [603, 194],
  [657, 208],
  [131, 176],
  [194, 177],
  [256, 181],
  [322, 185],
  [382, 193],
  [445, 200],
  [506, 211],
  [566, 219],
  [617, 225],
  [155, 210],
  [225, 218],
  [286, 218],
  [350, 226],
  [417, 230],
  [483, 238],
  [548, 250],
  [603, 250],
  [196, 236],
  [254, 242],
  [313, 248],
  [376, 251],
  [441, 258],
  [505, 268],
  [568, 276],
  [529, 314],
  [91, 123],
  [682, 194],
] as const;

const US_MAP_PATH =
  'M 42 101 L 54 88 L 74 78 L 96 81 L 117 69 L 147 72 L 169 61 L 201 67 L 224 60 L 253 66 L 279 76 L 301 81 L 319 75 L 338 88 L 365 89 L 387 99 L 410 107 L 433 108 L 455 103 L 472 112 L 496 113 L 517 123 L 545 124 L 567 130 L 591 137 L 614 143 L 640 154 L 665 164 L 688 170 L 706 180 L 726 182 L 735 198 L 724 208 L 708 204 L 699 215 L 689 224 L 675 219 L 666 231 L 651 231 L 641 243 L 623 244 L 617 257 L 606 258 L 601 273 L 593 276 L 586 291 L 579 302 L 571 316 L 561 337 L 549 351 L 542 371 L 531 380 L 521 365 L 516 349 L 506 340 L 499 322 L 492 306 L 480 296 L 465 289 L 451 288 L 439 278 L 424 277 L 411 282 L 397 275 L 383 279 L 369 274 L 357 277 L 345 270 L 329 272 L 318 267 L 303 270 L 292 264 L 277 266 L 260 258 L 247 263 L 233 254 L 218 249 L 203 253 L 187 247 L 174 239 L 161 239 L 150 228 L 135 223 L 127 211 L 115 209 L 107 197 L 94 194 L 83 181 L 70 179 L 62 166 L 54 159 L 60 145 L 53 133 L 42 124 L 46 111 Z';

export function CoverageMap() {
  return (
    <div
      className="relative w-full min-w-0 min-h-[var(--min-h-map)] md:min-h-[var(--min-h-map-md)] overflow-hidden rounded-xl border border-primary/20 bg-surface-2"
      data-testid="coverage-map"
      role="img"
      aria-label="Illustrated map of the United States filled with property pins showing Nova Havens nationwide coverage"
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.12), transparent 68%)' }}
      />
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
        <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
        Network coverage
      </div>
      <svg
        className="absolute inset-0 h-full w-full p-3 pt-7 md:p-5 md:pt-9"
        viewBox="0 0 780 410"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id="us-map-coverage-clip">
            <path d={US_MAP_PATH} />
          </clipPath>
          <filter id="property-pin-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={US_MAP_PATH}
          fill="hsl(var(--primary) / 0.08)"
          stroke="hsl(var(--primary) / 0.5)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M 60 329 L 73 320 L 91 324 L 107 333 L 122 332 L 133 343 L 125 352 L 108 350 L 97 359 L 80 354 L 67 358 L 54 347 Z"
          fill="hsl(var(--primary) / 0.08)"
          stroke="hsl(var(--primary) / 0.38)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M 145 353 L 159 350 L 173 356 L 184 365 L 174 371 L 159 367 L 147 361 Z"
          fill="hsl(var(--primary) / 0.08)"
          stroke="hsl(var(--primary) / 0.38)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <g clipPath="url(#us-map-coverage-clip)" fill="hsl(var(--primary) / 0.4)">
          {PROPERTY_DOT_POINTS.map((point, index) => (
            <circle key={index} cx={point.x} cy={point.y} r="2.25" />
          ))}
        </g>
        <g fill="hsl(var(--primary) / 0.94)" filter="url(#property-pin-glow)">
          {FEATURED_PROPERTY_PINS.map(([x, y], index) => (
            <g key={index} transform={`translate(${x} ${y})`}>
              <path d="M 0 -7 C -4.2 -7 -6.8 -4.1 -6.8 -0.6 C -6.8 4.1 0 9 0 9 S 6.8 4.1 6.8 -0.6 C 6.8 -4.1 4.2 -7 0 -7 Z" />
              <circle cx="0" cy="-1" r="2.1" fill="hsl(var(--background))" />
            </g>
          ))}
        </g>
        <g fill="hsl(var(--primary) / 0.8)">
          <circle cx="91" cy="340" r="3" />
          <circle cx="159" cy="360" r="3" />
        </g>
        <text x="55" y="391" fill="hsl(var(--muted-foreground))" fontSize="11" letterSpacing="1.5">
          48 STATES • VERIFIED HOMES
        </text>
      </svg>
      <div className="absolute bottom-3 right-4 flex items-center gap-2 text-xs font-medium text-muted-foreground md:bottom-4 md:right-5">
        <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
        Verified network coverage
      </div>
    </div>
  );
}
