import { PublicSite } from "@/components/renderer/public-site";
import { getPublishedSite } from "@/lib/sites/repository";
export default async function SitePage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <PublicSite slug={slug} initialSchema={await getPublishedSite(slug)}/>}
