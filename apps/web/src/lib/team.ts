import 'server-only';

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { TEAM_MEMBERS, type TeamMember, type TeamMemberProfile } from '@/content/team';

/** Shape of one member in data/team.json (written by scripts/sync-team.mjs). */
interface SyncedMember {
  name: string;
  slug: string;
  role: string;
  initials: string;
  photo: string | null;
  help: string;
  favouritePart: string;
  foods: string;
  laugh: string;
  spareTime: string;
}

const ANSWER_KEYS = ['help', 'favouritePart', 'foods', 'laugh', 'spareTime'] as const;

function isSyncedMember(value: unknown): value is SyncedMember {
  if (typeof value !== 'object' || value === null) return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.name === 'string' &&
    m.name.trim().length > 0 &&
    typeof m.initials === 'string' &&
    (m.photo === null || typeof m.photo === 'string') &&
    ANSWER_KEYS.every((key) => typeof m[key] === 'string')
  );
}

function toTeamMember(synced: SyncedMember): TeamMember {
  const profile = {} as TeamMemberProfile;
  for (const key of ANSWER_KEYS) profile[key] = synced[key];
  const hasProfile = ANSWER_KEYS.some((key) => synced[key].trim().length > 0);
  return {
    name: synced.name.trim(),
    role: synced.role || undefined,
    initials: synced.initials,
    profile: hasProfile ? profile : undefined,
    photoUrl: synced.photo || null,
  };
}

function rosterKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

/**
 * Prefer synced records for people they know about, while retaining newly
 * added fallback entries until the next sync publishes them.
 */
export function mergeRoster(synced: TeamMember[]): TeamMember[] {
  const names = new Set(synced.map((m) => rosterKey(m.name)));
  return [...synced, ...TEAM_MEMBERS.filter((m) => !names.has(rosterKey(m.name)))];
}

/** Build-time roster: data/team.json merged over the fallback list. */
export function getTeamRoster(): TeamMember[] {
  try {
    const file = join(process.cwd(), 'data', 'team.json');
    if (!existsSync(file)) return TEAM_MEMBERS;
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as { members?: unknown };
    if (!Array.isArray(parsed.members)) return TEAM_MEMBERS;
    const synced = parsed.members.filter(isSyncedMember).map(toTeamMember);
    return synced.length > 0 ? mergeRoster(synced) : TEAM_MEMBERS;
  } catch {
    return TEAM_MEMBERS;
  }
}
