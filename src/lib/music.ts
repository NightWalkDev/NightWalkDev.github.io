const PLATFORMS = {
  soundcloud: { label: 'SoundCloud', color: 'orange', icon: '/media/icons/soundcloud.svg' },
  spotify: { label: 'Spotify', color: 'mint', icon: '/media/icons/spotify.svg' },
  youtubeMusic: { label: 'YouTube Music', color: 'crimson', icon: '/media/icons/ytmusic.svg' },
} as const;

type Links = Partial<Record<keyof typeof PLATFORMS, string>>;

/** Only the links that were filled in, in a fixed order. */
export function listenLinks(links: Links) {
  return (Object.keys(PLATFORMS) as (keyof typeof PLATFORMS)[])
    .filter((key) => links[key])
    .map((key) => ({ ...PLATFORMS[key], href: links[key] as string }));
}

export function soundcloudPlayer(url: string) {
  const params = new URLSearchParams({ url, color: '#f9b143', visual: 'false', show_artwork: 'false', show_comments: 'false', show_reposts: 'false', hide_related: 'true', show_teaser: 'false' });
  return { src: `https://w.soundcloud.com/player/?${params}`, height: 166 };
}

export const TYPE_COLORS: Record<string, string> = { Album: 'crimson', EP: 'mint', Single: 'amber' };

export function yearRange(years: (number | undefined)[]) {
  const known = years.filter((y): y is number => y !== undefined);
  if (!known.length) return null;
  const min = Math.min(...known), max = Math.max(...known);
  return min === max ? String(min) : `${min} – ${max}`;
}
