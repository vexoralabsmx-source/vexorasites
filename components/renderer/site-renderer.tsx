"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, MoveRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { optimizeCloudinaryImage } from "@/lib/cloudinary";
import type { SiteSchema, SiteSection } from "@/types/site";

const registry: Record<
  SiteSection["type"],
  React.ComponentType<{ section: SiteSection }>
> = {
  hero: HeroBlock,
  story: StoryBlock,
  services: CardsBlock,
  gallery: GalleryBlock,
  testimonial: QuoteBlock,
  stats: CardsBlock,
  cta: CtaBlock,
  contact: CtaBlock,
  container: InternalBlock,
  columns: InternalBlock,
};

export const blockRegistry = Object.keys(registry) as SiteSection["type"][];

function SectionFrame({
  section,
  children,
  className,
}: {
  section: SiteSection;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      data-animate={section.animation.preset}
      data-duration={section.animation.duration ?? 1}
      data-delay={section.animation.delay ?? 0}
      data-easing={section.animation.easing ?? "power3.out"}
      className={cn(
        "relative isolate overflow-hidden",
        className,
        section.responsive.hideMobile && "max-sm:hidden",
      )}
      style={{
        background: section.styles.background,
        color: section.styles.foreground,
        paddingBlock: `${section.styles.padding}px`,
        paddingInline: "clamp(24px, 6vw, 96px)",
      }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: section.layout?.maxWidth ?? 1152 }}
      >
        {children}
      </div>
    </section>
  );
}

function ActionLink({
  href,
  label,
  className,
  style,
}: {
  href?: string;
  label: string;
  className: string;
  style?: React.CSSProperties;
}) {
  const target = href?.trim() || "#";
  return (
    <a
      href={target}
      target={target.startsWith("http") ? "_blank" : undefined}
      rel={target.startsWith("http") ? "noreferrer" : undefined}
      className={className}
      style={style}
    >
      {label}
      <ArrowUpRight size={18} />
    </a>
  );
}

function Eyebrow({ section }: { section: SiteSection }) {
  return section.content.eyebrow ? (
    <p
      className="mb-5 text-xs font-semibold uppercase tracking-[.22em]"
      style={{ color: section.styles.accent }}
    >
      {section.content.eyebrow}
    </p>
  ) : null;
}

function HeroBlock({ section }: { section: SiteSection }) {
  return (
    <SectionFrame section={section} className="min-h-[620px]">
      <div
        className={cn(
          "relative z-10 flex min-h-[410px] flex-col justify-end",
          section.styles.align === "center" && "items-center text-center",
        )}
      >
        <Eyebrow section={section} />
        <h1 className="max-w-5xl text-balance text-[clamp(3.1rem,8vw,7.5rem)] font-semibold leading-[.9] tracking-[-.065em]">
          {section.content.title}
        </h1>
        {section.content.body && (
          <p className="mt-8 max-w-2xl text-[clamp(1rem,1.6vw,1.3rem)] leading-relaxed opacity-70">
            {section.content.body}
          </p>
        )}
        {section.content.cta && (
          <ActionLink
            href={section.content.ctaHref}
            label={section.content.cta}
            className="mt-9 inline-flex min-h-12 items-center gap-3 self-start rounded-full px-6 font-semibold text-current ring-1 ring-current/25 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2"
            style={{ color: section.styles.accent }}
          />
        )}
        <div
          className="absolute -right-[8%] top-[2%] -z-10 aspect-square w-[44%] rounded-full opacity-50 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${section.styles.accent}, transparent 68%)`,
          }}
        />
      </div>
    </SectionFrame>
  );
}

function StoryBlock({ section }: { section: SiteSection }) {
  return (
    <SectionFrame section={section}>
      <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
        <div>
          <Eyebrow section={section} />
          <h2 className="text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[.95] tracking-[-.055em]">
            {section.content.title}
          </h2>
          <p className="mt-7 max-w-lg text-lg leading-relaxed opacity-70">
            {section.content.body}
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-current/10">
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${section.styles.accent}, transparent 35%), linear-gradient(145deg, transparent, ${section.styles.foreground}22)`,
            }}
          />
          <div className="absolute inset-8 rounded-[1.5rem] border border-current/15 backdrop-blur-sm" />
          <span className="absolute bottom-8 left-8 text-xs uppercase tracking-[.25em] opacity-60">
            Scroll story / 01—03
          </span>
        </div>
      </div>
    </SectionFrame>
  );
}

function CardsBlock({ section }: { section: SiteSection }) {
  const items = section.content.items ?? [
    { title: "01", text: "Primer elemento" },
    { title: "02", text: "Segundo elemento" },
    { title: "03", text: "Tercer elemento" },
  ];
  return (
    <SectionFrame section={section}>
      <Eyebrow section={section} />
      <h2 className="max-w-4xl text-[clamp(2.4rem,5vw,5rem)] font-semibold leading-[.96] tracking-[-.05em]">
        {section.content.title}
      </h2>
      <p className="mt-6 max-w-2xl text-lg opacity-65">
        {section.content.body}
      </p>
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <article
            key={`${item.title}-${index}`}
            className="group min-h-56 rounded-[1.5rem] border border-current/10 bg-current/[.035] p-7 transition duration-300 hover:-translate-y-1 hover:bg-current/[.07]"
          >
            <span className="text-xs tabular-nums opacity-45">
              0{index + 1}
            </span>
            <h3
              className="mt-16 text-3xl font-semibold tracking-[-.04em]"
              style={{ color: section.styles.accent }}
            >
              {item.title}
            </h3>
            <p className="mt-3 opacity-65">{item.text}</p>
          </article>
        ))}
      </div>
    </SectionFrame>
  );
}

function GalleryBlock({ section }: { section: SiteSection }) {
  const media = section.content.media ?? [];
  return (
    <SectionFrame section={section}>
      <div className={cn(section.styles.align === "center" && "text-center")}>
        <Eyebrow section={section} />
        <h2 className="text-[clamp(2.8rem,7vw,6rem)] font-semibold leading-[.92] tracking-[-.06em]">
          {section.content.title}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg opacity-65">
          {section.content.body}
        </p>
      </div>
      <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
        {(media.length
          ? media
          : ["18% 22%", "72% 25%", "32% 70%", "78% 76%"]
        ).map((item, index) => (
          <div
            key={typeof item === "string" ? item : item.publicId}
            className={cn(
              "relative overflow-hidden rounded-[1.5rem] border border-current/10 bg-black/10",
              index % 2 ? "aspect-[3/4]" : "aspect-[4/5] md:mt-14",
            )}
          >
            {typeof item === "string" ? (
              <div
                className="absolute inset-0 transition duration-700 hover:scale-105"
                style={{
                  background: `radial-gradient(circle at ${item}, ${section.styles.accent}, transparent 23%), linear-gradient(${130 + index * 25}deg, ${section.styles.foreground}10, ${section.styles.foreground}55)`,
                }}
              />
            ) : item.type === "video" ? (
              <video
                src={item.url}
                controls
                playsInline
                preload="metadata"
                className="size-full object-cover"
                aria-label={item.alt || `Video ${index + 1}`}
              />
            ) : (
              <Image
                src={optimizeCloudinaryImage(item.url)}
                alt={
                  item.alt || `Imagen ${index + 1} de ${section.content.title}`
                }
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition duration-700 hover:scale-105"
              />
            )}
            <span className="pointer-events-none absolute bottom-5 left-5 text-xs uppercase tracking-[.2em] text-white drop-shadow">
              Edition 0{index + 1}
            </span>
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}

function QuoteBlock({ section }: { section: SiteSection }) {
  return (
    <SectionFrame section={section}>
      <div className="mx-auto max-w-5xl text-center">
        <span className="text-7xl leading-none opacity-20">“</span>
        <h2 className="text-balance text-[clamp(2.2rem,5vw,4.8rem)] font-medium leading-[1.05] tracking-[-.045em]">
          {section.content.title}
        </h2>
        <p className="mt-8 text-sm uppercase tracking-[.18em] opacity-55">
          {section.content.body}
        </p>
      </div>
    </SectionFrame>
  );
}

function CtaBlock({ section }: { section: SiteSection }) {
  return (
    <SectionFrame section={section}>
      <div
        className={cn(
          "flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between",
          section.styles.align === "center" &&
            "items-center text-center lg:flex-col lg:items-center",
        )}
      >
        <div>
          <Eyebrow section={section} />
          <h2 className="max-w-4xl text-balance text-[clamp(2.8rem,7vw,6.5rem)] font-semibold leading-[.9] tracking-[-.06em]">
            {section.content.title}
          </h2>
          <p className="mt-6 text-lg opacity-65">{section.content.body}</p>
        </div>
        <a
          href={section.content.ctaHref || "#"}
          className="inline-flex min-h-14 shrink-0 items-center gap-5 rounded-full border border-current/20 px-7 font-semibold transition hover:bg-current hover:text-[var(--cta-bg)] focus-visible:outline-none focus-visible:ring-2"
          style={
            { "--cta-bg": section.styles.background } as React.CSSProperties
          }
        >
          {section.content.cta ?? "Hablemos"}
          <MoveRight />
        </a>
      </div>
    </SectionFrame>
  );
}

function InternalBlock({ section }: { section: SiteSection }) {
  const elements = section.elements?.length
    ? section.elements
    : [
        {
          id: "heading",
          type: "heading" as const,
          text: section.content.title,
          href: "",
          imageUrl: "",
        },
        {
          id: "text",
          type: "text" as const,
          text:
            section.content.body ??
            "Edita los elementos internos desde el panel.",
          href: "",
          imageUrl: "",
        },
      ];
  return (
    <SectionFrame section={section}>
      <div
        className="vexora-inner-grid grid"
        style={{
          gap: section.layout?.gap ?? 24,
          gridTemplateColumns: `repeat(${section.layout?.columns ?? (section.type === "columns" ? 2 : 1)}, minmax(0, 1fr))`,
        }}
      >
        {elements.map((element) => (
          <div
            key={element.id}
            className="min-w-0 rounded-3xl border border-current/10 bg-current/[.035] p-6"
          >
            {element.type === "heading" && (
              <h2 className="text-3xl font-semibold tracking-[-.04em]">
                {element.text}
              </h2>
            )}
            {element.type === "text" && (
              <p className="leading-relaxed opacity-70">{element.text}</p>
            )}
            {element.type === "button" && (
              <ActionLink
                href={element.href}
                label={element.text || "Continuar"}
                className="inline-flex min-h-12 items-center gap-3 rounded-full border border-current/20 px-5 font-semibold"
              />
            )}
            {element.type === "image" && element.imageUrl && (
              <div className="relative aspect-video overflow-hidden rounded-2xl">
                <Image
                  src={element.imageUrl}
                  alt={element.text || "Imagen"}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}

export function SiteRenderer({
  schema,
  pageSlug = "",
  editable = false,
  selectedId,
  onSelect,
}: {
  schema: SiteSchema;
  pageSlug?: string;
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const page =
    schema.pages.find((item) => item.slug === pageSlug) ?? schema.pages[0];
  useEffect(() => {
    if (
      editable ||
      !root.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      root.current
        ?.querySelectorAll<HTMLElement>("[data-animate]")
        .forEach((element) => {
          const preset = element.dataset.animate;
          if (preset === "none") return;
          gsap.fromTo(
            element.children[0],
            {
              opacity: 0,
              y: preset === "slide-left" ? 0 : 48,
              x: preset === "slide-left" ? -48 : 0,
              scale: preset === "zoom-reveal" ? 0.94 : 1,
              filter: preset === "blur-reveal" ? "blur(14px)" : "blur(0px)",
            },
            {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: Number(element.dataset.duration) || 1,
              delay: Number(element.dataset.delay) || 0,
              ease: element.dataset.easing || "power3.out",
              scrollTrigger: { trigger: element, start: "top 82%", once: true },
            },
          );
        });
    }, root);
    return () => context.revert();
  }, [schema, pageSlug, editable]);
  const navigation = schema.site.navigation;
  const footer = schema.site.footer;
  return (
    <div
      ref={root}
      className={cn(
        "min-h-full bg-black",
        editable && "[&_a]:pointer-events-none",
      )}
    >
      {navigation?.enabled !== false && (
        <nav
          aria-label="Páginas del sitio"
          className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-4 border-b border-white/10 bg-black/80 px-5 text-white backdrop-blur-xl md:px-10"
        >
          <Link
            href={`/site/${schema.site.slug}`}
            className="shrink-0 font-semibold tracking-[-.03em]"
          >
            {navigation?.logoText || schema.site.name}
          </Link>
          <div className="flex items-center gap-1 overflow-x-auto">
            {schema.pages.map((item) => (
              <Link
                key={item.id}
                href={`/site/${schema.site.slug}${item.slug ? `/${item.slug}` : ""}`}
                className={cn(
                  "inline-flex min-h-10 shrink-0 items-center rounded-full px-3 text-xs font-medium",
                  item.id === page.id
                    ? "bg-white text-black"
                    : "text-white/55 hover:bg-white/10 hover:text-white",
                )}
              >
                {item.name}
              </Link>
            ))}
            {navigation?.ctaLabel && (
              <a
                href={navigation.ctaHref || "#"}
                className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-violet-500 px-4 text-xs font-semibold text-white"
              >
                {navigation.ctaLabel}
              </a>
            )}
          </div>
        </nav>
      )}
      {page?.sections.map((section) => {
        const Block = registry[section.type] ?? StoryBlock;
        return (
          <div
            key={section.id}
            role={editable ? "button" : undefined}
            tabIndex={editable ? 0 : undefined}
            aria-label={
              editable
                ? `Seleccionar sección ${section.content.title}`
                : undefined
            }
            onClick={(event) => {
              if (!editable) return;
              event.stopPropagation();
              onSelect?.(section.id);
            }}
            onKeyDown={(event) => {
              if (editable && (event.key === "Enter" || event.key === " "))
                onSelect?.(section.id);
            }}
            className={cn(
              editable &&
                "relative cursor-pointer outline-none ring-inset transition",
              selectedId === section.id && "z-10 ring-2 ring-violet-400",
            )}
          >
            <Block section={section} />
            {editable && selectedId === section.id && (
              <span className="absolute left-3 top-3 z-20 rounded-md bg-violet-500 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-lg">
                {section.type}
              </span>
            )}
          </div>
        );
      })}
      {footer?.enabled !== false && (
        <footer className="border-t border-white/10 bg-[#09090c] px-6 py-14 text-white md:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="max-w-xl text-3xl font-semibold tracking-[-.04em]">
                {footer?.headline || "Construyamos algo extraordinario."}
              </p>
              <p className="mt-4 text-sm text-white/40">
                © {new Date().getFullYear()}{" "}
                {navigation?.logoText || schema.site.name}.{" "}
                {footer?.copyright || "Todos los derechos reservados."}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-white/55">
              {schema.pages.map((item) => (
                <Link
                  key={item.id}
                  href={`/site/${schema.site.slug}${item.slug ? `/${item.slug}` : ""}`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
