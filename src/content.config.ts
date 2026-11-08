import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const link = z.object({ label: z.string(), href: z.string() });

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    engine: z.string(),
    role: z.string(),
    scope: z.string(),
    cover: z.string(),
    coverAlt: z.string(),
    order: z.number().default(99),
    color: z.string().optional(),
    model: z.string().optional(),
    links: z.array(link).default([]),
    draft: z.boolean().default(false),
  }),
});

const prototypes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/prototypes' }),
  schema: z.object({
    title: z.string(),
    tag: z.string(),
    summary: z.string(),
    cover: z.string().optional(),
    coverAlt: z.string().default(''),
    order: z.number().default(99),
    color: z.string().optional(),
    model: z.string().optional(),
    links: z.array(link).default([]),
    draft: z.boolean().default(false),
  }),
});

const art = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/art' }),
  schema: z.object({
    title: z.string(),
    image: z.string(),
    imageAlt: z.string(),
    order: z.number().default(99),
    link: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, prototypes, art };
