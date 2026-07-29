/**
 * teamMembers.ts — single source of truth for the Nova Havens roster.
 *
 * Consumed by TeamPage.tsx (grid) and routeMeta.ts (Person JSON-LD), so the
 * page and structured data cannot drift.
 *
 * Rules for this data (per client instruction):
 * - Listed alphabetically by first name.
 * - "[Role TBC]" is a deliberate, visible placeholder — do not invent titles.
 * - "[Bio pending]" is a deliberate placeholder — never write invented
 *   biographies for real named people who have not supplied one.
 * - No phone numbers or emails for individuals; contact routing stays on the
 *   Contact page and intake forms.
 *
 * Must stay free of browser APIs and React — imported by Node build scripts.
 */

export const ROLE_TBC = '[Role TBC]';
export const BIO_PENDING = '[Bio pending]';

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  { name: 'Alishia Isaac', role: ROLE_TBC, bio: BIO_PENDING, initials: 'AI' },
  { name: 'Brenda Mlunjwa', role: ROLE_TBC, bio: BIO_PENDING, initials: 'BM' },
  { name: 'Chane Burger', role: ROLE_TBC, bio: BIO_PENDING, initials: 'CB' },
  { name: 'Dian Kühn', role: 'Jr National Account Manager', bio: BIO_PENDING, initials: 'DK' },
  { name: 'Fazal Abed', role: 'AI Engineer', bio: BIO_PENDING, initials: 'FA' },
  { name: 'Gabriela Sidoli', role: ROLE_TBC, bio: BIO_PENDING, initials: 'GS' },
  { name: 'Keti Barkalaia', role: ROLE_TBC, bio: BIO_PENDING, initials: 'KB' },
  { name: 'Maria Antonia', role: ROLE_TBC, bio: BIO_PENDING, initials: 'MA' },
  { name: 'Marie Evans', role: ROLE_TBC, bio: BIO_PENDING, initials: 'ME' },
  { name: 'Melissa Concepcion', role: 'National Account Manager', bio: BIO_PENDING, initials: 'MC' },
  { name: 'Paulina Avellaneda', role: 'Senior Property Coordinator', bio: BIO_PENDING, initials: 'PA' },
  { name: 'Salma Machkour', role: 'Operations Support Specialist', bio: BIO_PENDING, initials: 'SM' },
  { name: 'Samer Imad El Sawi', role: 'Operations Support Specialist', bio: BIO_PENDING, initials: 'SE' },
  { name: 'Sydney Green', role: ROLE_TBC, bio: BIO_PENDING, initials: 'SG' },
  { name: 'William Dotson', role: ROLE_TBC, bio: BIO_PENDING, initials: 'WD' },
];
