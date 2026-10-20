import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { EXPERIMENT_CATEGORIES } from "./lib/categories";

const propSchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  type: z.enum(["number", "color", "text", "boolean", "colors", "select"]),
  default: z.any().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  options: z.array(z.string()).optional(),
  themed: z.boolean().optional(),
});

const experiments = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/experiments" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Entrada: el scaffold crea "pendiente"; al publicar, change-experiment-category decide la final.
    category: z.enum(EXPERIMENT_CATEGORIES),
    component: z.string(),
    props: z.array(propSchema).default([]),
  }),
});

const ui = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/ui" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string().default("buttons"),
    component: z.string(),
    props: z.array(propSchema).default([]),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { experiments, ui, pages };
