/** Turn a synced Object Storage photo key into the public API route the page uses. */
export function teamPhotoUrl(baseUrl: string, key: string): string {
  return `${baseUrl}api/team/images/${key.replace(/^team\//, '')}`;
}