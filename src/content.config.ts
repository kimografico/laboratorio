import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const propSchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  type: z.enum(["number", "color", "text", "boolean", "colors", "select"]),
  default: z.any().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  options: z.array(z.string()).optional(),
});

const experiments = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/experiments" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(["backgrounds", "texts"]),
    component: z.string(),
    accent: z.string().optional(),
    props: z.array(propSchema).default([]),
  }),
});

export const collections = { experiments };
