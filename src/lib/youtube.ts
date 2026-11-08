/** Accepts a full YouTube link (watch, youtu.be, shorts, embed) or a bare video id. */
export function youtubeEmbedUrl(linkOrId: string): string {
  const match = linkOrId.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  return `https://www.youtube-nocookie.com/embed/${match ? match[1] : linkOrId.trim()}`;
}
