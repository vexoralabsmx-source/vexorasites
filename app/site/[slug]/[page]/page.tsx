import { notFound } from "next/navigation";
import { PublicSite } from "@/components/renderer/public-site";
import { getPublishedSite } from "@/lib/sites/repository";

export default async function PublishedPage({ params }: { params: Promise<{ slug: string; page: string }> }) {
  const { slug, page } = await params;
  const schema = await getPublishedSite(slug);
  if (schema && !schema.pages.some((item) => item.slug === page)) notFound();
  return <PublicSite slug={slug} pageSlug={page} initialSchema={schema}/>;
}
