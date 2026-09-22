/**
 * howItWorks.ts — single source of truth for the "How It Works" content
 * shown on the homepage, and mirrored into the HowTo JSON-LD schema
 * (routeMeta.ts) and the crawler-facing prerendered HTML (routeContent.ts).
 *
 * HomePage.tsx is the real source of truth for what visitors see, so its
 * copy is canonical here. routeMeta.ts and routeContent.ts must derive their
 * HowTo steps from this file instead of hardcoding their own copies, or the
 * three surfaces will silently drift apart again.
 */

export interface HowItWorksStep {
  name: string;
  text: string;
}

export interface HowItWorksTrack {
  /** Stable id used in data-testid attributes and tab values, e.g. "adjusters". */
  id: string;
  /** Label shown on the homepage tab trigger. */
  tabLabel: string;
  /** Heading used for this track in the crawler-facing HTML (routeContent.ts). */
  htmlHeading: string;
  /** `name` for this track's HowTo JSON-LD schema entry. */
  schemaName: string;
  /** `description` for this track's HowTo JSON-LD schema entry. */
  schemaDescription: string;
  steps: HowItWorksStep[];
}

export const HOW_IT_WORKS_TRACKS: HowItWorksTrack[] = [
  {
    id: 'adjusters',
    tabLabel: 'Carriers & Specialists',
    htmlHeading: 'For Carriers & Specialists',
    schemaName: 'How Carriers & Specialists Work with Nova Havens',
    schemaDescription:
      'The step-by-step process for carriers and specialists to coordinate temporary housing placements through Nova Havens.',
    steps: [
      {
        name: 'Submit a Claim',
        text: 'Within the hour.',
      },
      {
        name: 'Approve and coordinate',
        text: 'Keeps carriers and specialists updated',
      },
      {
        name: 'Move in',
        text: 'Nova Havens coordinates all move-in logistics with one point of contact.',
      },
    ],
  },
  {
    id: 'families',
    tabLabel: 'Displaced Families',
    htmlHeading: 'For Displaced Families',
    schemaName: 'How Displaced Families Get Placed with Nova Havens',
    schemaDescription:
      'The step-by-step process for displaced families to move into temporary furnished housing through Nova Havens.',
    steps: [
      {
        name: 'Receive Your Options',
        text: 'Your adjuster or carrier connects you with Nova Havens — typically within hours of your ALE coverage being confirmed',
      },
      {
        name: 'Choose Your Home',
        text: "Browse furnished options matched to your family's size, location, school district, pet needs, and accessibility requirements",
      },
      {
        name: 'Move In',
        text: 'Nova Havens coordinates move-in logistics with your carrier and the property owner — you get the keys and a direct line to your coordinator',
      },
    ],
  },
];
