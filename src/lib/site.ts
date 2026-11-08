import { parse } from 'yaml';
import { z } from 'astro/zod';
import raw from '../content/site.yaml?raw';

const link = z.object({ label: z.string(), href: z.string() });

const section = z.discriminatedUnion('type', [
  z.object({ type: z.literal('showreel'), id: z.string(), title: z.string(), note: z.string().optional(), image: z.string().optional(), youtube: z.string().optional() }),
  z.object({ type: z.literal('projects'), id: z.string(), title: z.string(), note: z.string().optional(), color: z.string().optional(), featured: z.number().default(2) }),
  z.object({ type: z.literal('prototypes'), id: z.string(), title: z.string(), note: z.string().optional(), color: z.string().optional() }),
  z.object({ type: z.literal('art'), id: z.string(), title: z.string(), note: z.string().optional(), color: z.string().optional() }),
  z.object({ type: z.literal('text'), id: z.string(), title: z.string(), note: z.string().optional(), color: z.string().optional(), text: z.string() }),
]);

const planet = z.object({ color: z.string(), size: z.number(), atmosphere: z.string().optional(), ring: z.string().optional() });

const siteSchema = z.object({
  title: z.string(),
  description: z.string(),
  engineColors: z.record(z.string(), z.string()).default({}),
  nav: z.array(link),
  hero: z.object({
    openToWork: z.boolean(),
    badge: z.string(),
    name: z.string(),
    role: z.string(),
    intro: z.string(),
    vhsOverlay: z.boolean().default(true),
    buttons: z.array(link.extend({ color: z.string().optional() })),
  }),
  profile: z.array(z.object({ title: z.string(), color: z.string().optional(), text: z.string() })),
  preview: z.object({
    title: z.string(),
    label: z.string().default(''),
    scene: z.enum(['solar', 'model']),
    model: z.string().optional(),
    modelFront: z.enum(['+Z', '-Z', '+X', '-X']).default('-Z'),
    modelColor: z.string().default('#FFC83D'),
    light: z.object({ angle: z.number(), height: z.number() }).optional(),
    camera: z.object({ zoom: z.number(), zoomMin: z.number(), zoomMax: z.number(), tilt: z.number(), spin: z.number(), ortho: z.boolean() }).partial().optional(),
    solar: z.object({
      sun: z.object({ color: z.string(), size: z.number(), glow: z.number() }),
      orbits: z.object({ show: z.boolean(), color: z.string(), speed: z.number(), speedRatio: z.number(), spacing: z.number(), spacingRatio: z.number() }),
      planets: z.array(planet).min(1),
    }).optional(),
  }),
  sections: z.array(section),
  contact: z.object({
    id: z.string(),
    title: z.string(),
    color: z.string().optional(),
    text: z.string().optional(),
    links: z.array(link.extend({ icon: z.enum(['mail', 'person', 'code', 'play', 'music', 'link']).default('link'), color: z.string() })),
  }),
  footer: z.string(),
});

export type Site = z.infer<typeof siteSchema>;
export type PreviewConfig = Site['preview'];

function load(): Site {
  const result = siteSchema.safeParse(parse(raw));
  if (!result.success) {
    const problems = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`src/content/site.yaml has a problem:\n${problems}`);
  }
  return result.data;
}

export const site = load();

export function engineColor(engine: string, override?: string): string {
  return override ?? site.engineColors[engine] ?? 'cream';
}
