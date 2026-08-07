import { MediaCenter } from "@/components/media/media-center";
import { requireUser } from "@/lib/supabase/server";

export default async function MediaPage() {
  await requireUser();
  return <MediaCenter />;
}
