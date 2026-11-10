const PLATFORMS = {
  soundcloud: { label: 'SoundCloud', color: '#FF5500', icon: '/media/icons/soundcloud.svg' },
  spotify: { label: 'Spotify', color: '#1ED760', icon: '/media/icons/spotify.svg' },
  youtube: { label: 'YouTube', color: '#FF0000', icon: '/media/icons/yt.svg' },
  youtubeMusic: { label: 'YouTube Music', color: '#FF0000', icon: '/media/icons/ytmusic.svg' },
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
