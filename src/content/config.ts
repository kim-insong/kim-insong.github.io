import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    publishDate: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional().default(false),
  }),
});

const wiki = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional().default(false),
    sources: z.array(z.string()).optional(),
  }),
});

const apps = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    description: z.string(),
    platform: z.string(),
    status: z.string(),
    features: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })),
    screenshots: z.array(z.string()).optional(),
    appStoreUrl: z.string().optional(),
    publishDate: z.coerce.date(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog, wiki, apps };
