const PLATFORMS = {
  soundcloud: { label: 'SoundCloud', color: '#FF8A3D' },
  spotify: { label: 'Spotify', color: '#1ED760' },
  youtube: { label: 'YouTube', color: '#FF4B3E' },
  bandcamp: { label: 'Bandcamp', color: '#34D3E8' },
} as const;

type Links = Partial<Record<keyof typeof PLATFORMS, string>>;

/** Only the links that were filled in, in a fixed order. */
export function listenLinks(links: Links) {
  return (Object.keys(PLATFORMS) as (keyof typeof PLATFORMS)[])
    .filter((key) => links[key])
    .map((key) => ({ ...PLATFORMS[key], href: links[key] as string }));
}

export function soundcloudPlayer(url: string) {
  const isSet = url.includes('/sets/');
  const params = new URLSearchParams({ url, color: '#ffc83d', visual: 'true', show_comments: 'false', show_reposts: 'false', hide_related: 'true' });
  return { src: `https://w.soundcloud.com/player/?${params}`, height: isSet ? 450 : 300 };
}

export const TYPE_COLORS: Record<string, string> = { Album: 'rust', EP: 'teal', Single: 'yellow' };

export function yearRange(years: (number | undefined)[]) {
  const known = years.filter((y): y is number => y !== undefined);
  if (!known.length) return null;
  const min = Math.min(...known), max = Math.max(...known);
  return min === max ? String(min) : `${min} – ${max}`;
}
