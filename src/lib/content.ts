import { getCollection } from 'astro:content';

const byOrder = (a: { data: { order: number } }, b: { data: { order: number } }) => a.data.order - b.data.order;

export const getProjects = async () => (await getCollection('projects', (e) => !e.data.draft)).sort(byOrder);
export const getPrototypes = async () => (await getCollection('prototypes', (e) => !e.data.draft)).sort(byOrder);
export const getArt = async () => (await getCollection('art', (e) => !e.data.draft)).sort(byOrder);
