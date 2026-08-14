/**
 * One-shot bootstrap: seeds team/team.json in Object Storage from the
 * hardcoded fallback roster, so /api/team/team.json serves real data before
 * the first daily sync-team.js run. Safe to delete after the sync is live.
 */
import { Client } from '@replit/object-storage';
import { TEAM_MEMBERS } from '../src/data/teamMembers.ts';

const storage = new Client();
const payload = {
  generatedAt: new Date().toISOString(),
  count: TEAM_MEMBERS.length,
  members: TEAM_MEMBERS.map((m) => ({
    name: m.name,
    slug: m.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    role: m.role ?? '',
    initials: m.initials,
    photo: null,
    ...m.profile,
  })),
};
const result = await storage.uploadFromText('team/team.json', JSON.stringify(payload, null, 2));
if (!result.ok) {
  console.error('Seed failed:', result.error.message);
  process.exit(1);
}
console.log(`Seeded team/team.json with ${payload.count} members.`);
