import { lazy, type ComponentType } from 'react';
import {
  BrandPage,
  ColorsPage,
  FontsPage,
  LayoutPage,
  OverviewPage,
} from './foundations';

function lazyPage(load: () => Promise<ComponentType>) {
  return lazy(async () => ({ default: await load() }));
}

const ButtonDemo = lazyPage(() =>
  import('./demos/button').then(({ ButtonDemo }) => ButtonDemo),
);
const FormDemo = lazyPage(() =>
  import('./demos/form').then(({ FormDemo }) => FormDemo),
);
const SheetDemo = lazyPage(() =>
  import('./demos/sheet').then(({ SheetDemo }) => SheetDemo),
);
const CardDemo = lazyPage(() =>
  import('./demos/card').then(({ CardDemo }) => CardDemo),
);
const TabsDemo = lazyPage(() =>
  import('./demos/tabs').then(({ TabsDemo }) => TabsDemo),
);
const ElegantCarouselDemo = lazyPage(() =>
  import('./demos/elegant-carousel').then(({ ElegantCarouselDemo }) => ElegantCarouselDemo),
);
const ToastDemo = lazyPage(() =>
  import('./demos/toast').then(({ ToastDemo }) => ToastDemo),
);

export type PreviewEntry = {
  id: string;
  name: string;
  description: string;
  Page: ComponentType;
};

export type NavGroup = {
  name: string;
  entries: PreviewEntry[];
};

export const DESIGN_SYSTEM = {
  title: 'Nova Havens Design System',
  description:
    'A calm, high-trust visual system for emergency housing, adjuster workflows, and furnished-property partnerships.',
} as const;

export const OVERVIEW_ENTRY: PreviewEntry = {
  id: 'overview',
  name: 'Overview',
  description: 'The visual foundations and pilot components extracted from Nova Havens.',
  Page: OverviewPage,
};

export const NAV_GROUPS: NavGroup[] = [
  {
    name: 'Brand',
    entries: [
      {
        id: 'brand-principles',
        name: 'Brand principles',
        description: 'Wordmark treatment, trust cues, and the system’s visual point of view.',
        Page: BrandPage,
      },
    ],
  },
  {
    name: 'Colors',
    entries: [
      {
        id: 'color-roles',
        name: 'Color roles',
        description: 'The single-gold brand accent, dark surfaces, text hierarchy, and derived light mode.',
        Page: ColorsPage,
      },
    ],
  },
  {
    name: 'Fonts',
    entries: [
      {
        id: 'type-scale',
        name: 'Type scale',
        description: 'Plus Jakarta Sans, display hierarchy, body copy, labels, and captions.',
        Page: FontsPage,
      },
    ],
  },
  {
    name: 'Layout',
    entries: [
      {
        id: 'spacing-radius',
        name: 'Spacing and radius',
        description: 'The 4px rhythm, container widths, fluid hero scale, and rounded surfaces.',
        Page: LayoutPage,
      },
    ],
  },
  {
    name: 'Actions',
    entries: [
      {
        id: 'button',
        name: 'Buttons',
        description: 'Primary, secondary, outline, ghost, link, destructive, size, and loading states.',
        Page: ButtonDemo,
      },
    ],
  },
  {
    name: 'Forms & inputs',
    entries: [
      {
        id: 'form-field-kit',
        name: 'Form field kit',
        description: 'Accessible labels, inputs, select, textarea, validation, and submit behavior.',
        Page: FormDemo,
      },
    ],
  },
  {
    name: 'Overlays',
    entries: [
      {
        id: 'sheet',
        name: 'Sheet',
        description: 'Responsive edge-aligned navigation and utility panels.',
        Page: SheetDemo,
      },
    ],
  },
  {
    name: 'Data display',
    entries: [
      {
        id: 'card',
        name: 'Card',
        description: 'Rounded grouped content surfaces with clear hierarchy.',
        Page: CardDemo,
      },
    ],
  },
  {
    name: 'Menus & navigation',
    entries: [
      {
        id: 'tabs',
        name: 'Tabs',
        description: 'Audience or workflow views within a shared content region.',
        Page: TabsDemo,
      },
    ],
  },
  {
    name: 'Feedback & motion',
    entries: [
      {
        id: 'elegant-carousel',
        name: 'Elegant carousel',
        description: 'Timed property and testimonial storytelling with direct controls and touch support.',
        Page: ElegantCarouselDemo,
      },
      {
        id: 'toast',
        name: 'Toast',
        description: 'Transient provider-backed feedback with close and recovery actions.',
        Page: ToastDemo,
      },
    ],
  },
];

export const ALL_ENTRIES: PreviewEntry[] = [
  OVERVIEW_ENTRY,
  ...NAV_GROUPS.flatMap((group) => group.entries),
];

const duplicateIds = ALL_ENTRIES.map((entry) => entry.id).filter(
  (id, index, ids) => ids.indexOf(id) !== index,
);
if (duplicateIds.length > 0) {
  throw new Error(
    `Duplicate preview page id(s): ${[...new Set(duplicateIds)].join(', ')}`,
  );
}