/**
 * "How It Works" tracks shown on the homepage and mirrored into HowTo JSON-LD.
 */
export interface HowItWorksStep {
  name: string;
  text: string;
}

export interface HowItWorksTrack {
  id: string;
  tabLabel: string;
  heading: string;
  schemaName: string;
  schemaDescription: string;
  steps: HowItWorksStep[];
}

export const HOW_IT_WORKS_TRACKS: HowItWorksTrack[] = [
  {
    id: 'families',
    tabLabel: 'Displaced Families',
    heading: 'For Displaced Families',
    schemaName: 'How Displaced Families Get Placed with Nova Havens',
    schemaDescription:
      'The step-by-step process for displaced families to move into temporary furnished housing through Nova Havens.',
    steps: [
      {
        name: 'Receive Your Options',
        text: 'Once your claim is processed, Nova Havens connects you with housing options — typically within 24–48 hours of coverage confirmation.',
      },
      {
        name: 'Choose Your Home',
        text: "Browse furnished options matched to your family's size, location, school district, pet needs, and accessibility requirements.",
      },
      {
        name: 'Move In',
        text: 'Nova Havens coordinates move-in logistics with the property owner — you get the keys and a direct line to your coordinator.',
      },
    ],
  },
];
