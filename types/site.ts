import { z } from "zod";

export const animationPresetSchema = z.enum([
  "none",
  "fade-up",
  "blur-reveal",
  "slide-left",
  "zoom-reveal",
  "parallax",
  "scroll-driven",
  "sticky-story",
  "horizontal-journey",
]);

export const fontFamilySchema = z.enum([
  "geist",
  "manrope",
  "space-grotesk",
  "cormorant",
  "ibm-plex-mono",
]);

export const blockTypeSchema = z.enum([
  "hero",
  "story",
  "services",
  "gallery",
  "testimonial",
  "stats",
  "cta",
  "contact",
  "container",
  "columns",
]);

export const siteElementSchema = z.object({
  id: z.string(),
  type: z.enum(["heading", "text", "button", "image"]),
  text: z.string().default(""),
  href: z.string().default(""),
  imageUrl: z.string().default(""),
});

export const siteSectionSchema = z.object({
  id: z.string(),
  type: blockTypeSchema,
  variant: z.string(),
  content: z.object({
    eyebrow: z.string().optional(),
    title: z.string(),
    body: z.string().optional(),
    cta: z.string().optional(),
    ctaHref: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), text: z.string() }))
      .optional(),
    media: z
      .array(
        z.object({
          url: z.string().url(),
          publicId: z.string(),
          type: z.enum(["image", "video"]),
          alt: z.string().default(""),
          width: z.number().positive().optional(),
          height: z.number().positive().optional(),
        }),
      )
      .optional(),
  }),
  elements: z.array(siteElementSchema).optional(),
  layout: z
    .object({
      columns: z.number().int().min(1).max(4).default(1),
      gap: z.number().min(8).max(64).default(24),
      maxWidth: z.number().min(640).max(1600).default(1280),
    })
    .optional(),
  styles: z.object({
    background: z.string(),
    foreground: z.string(),
    accent: z.string(),
    align: z.enum(["left", "center"]),
    padding: z.number().min(32).max(192),
    typography: z
      .object({
        headingFont: fontFamilySchema.optional(),
        bodyFont: fontFamilySchema.optional(),
        headingScale: z.number().min(0.65).max(1.35).default(1),
        bodyScale: z.number().min(0.8).max(1.25).default(1),
        lineHeight: z.number().min(0.8).max(1.5).default(1),
        letterSpacing: z.number().min(-0.08).max(0.08).default(0),
      })
      .optional(),
  }),
  responsive: z.object({
    hideMobile: z.boolean().default(false),
    mobilePadding: z.number().min(20).max(96).default(48),
  }),
  animation: z.object({
    preset: animationPresetSchema,
    intensity: z.number().min(0).max(100),
    scrub: z.boolean(),
    duration: z.number().min(0.15).max(3).optional(),
    delay: z.number().min(0).max(2).optional(),
    easing: z
      .enum(["power2.out", "power3.out", "back.out", "expo.out"])
      .optional(),
    start: z.enum(["top 90%", "top 75%", "top 60%", "top top"]).optional(),
    end: z.enum(["bottom 20%", "bottom top", "+=100%", "+=180%"]).optional(),
    pin: z.boolean().optional(),
    stagger: z.number().min(0).max(0.3).optional(),
  }),
  locked: z.boolean().default(false),
});

export const siteSchema = z.object({
  site: z.object({
    id: z.string(),
    name: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    description: z.string(),
    templateId: z.string(),
    status: z.enum(["draft", "changes", "published"]),
    theme: z.object({
      colors: z.object({
        background: z.string(),
        foreground: z.string(),
        accent: z.string(),
      }),
      radius: z.number(),
      typography: z
        .object({
          headingFont: fontFamilySchema.default("geist"),
          bodyFont: fontFamilySchema.default("geist"),
          headingScale: z.number().min(0.75).max(1.25).default(1),
          bodyScale: z.number().min(0.85).max(1.2).default(1),
        })
        .optional(),
    }),
    navigation: z
      .object({
        enabled: z.boolean().default(true),
        logoText: z.string().default(""),
        ctaLabel: z.string().default("Contacto"),
        ctaHref: z.string().default("#contacto"),
      })
      .optional(),
    footer: z
      .object({
        enabled: z.boolean().default(true),
        headline: z.string().default("Construyamos algo extraordinario."),
        copyright: z.string().default("Todos los derechos reservados."),
        showLinks: z.boolean().default(true),
        layout: z.enum(["split", "stacked", "centered"]).default("split"),
        background: z.string().default("#09090c"),
        foreground: z.string().default("#ffffff"),
      })
      .optional(),
  }),
  pages: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      sections: z.array(siteSectionSchema),
    }),
  ),
});

export type AnimationPreset = z.infer<typeof animationPresetSchema>;
export type BlockType = z.infer<typeof blockTypeSchema>;
export type SiteSection = z.infer<typeof siteSectionSchema>;
export type SiteSchema = z.infer<typeof siteSchema>;
export type SitePage = SiteSchema["pages"][number];
export type DeviceMode = "desktop" | "tablet" | "mobile";

export interface TemplateDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  palette: [string, string, string];
  premium: boolean;
  schema: SiteSchema;
}

export interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  template: string;
  status: "draft" | "changes" | "published";
  updatedAt: string;
  palette: [string, string];
}
