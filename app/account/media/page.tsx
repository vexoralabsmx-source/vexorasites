import { MediaCenter } from "@/components/media/media-center";
import { requireUser } from "@/lib/supabase/server";

export default async function MediaPage() {
  await requireUser();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";
  return <MediaCenter cloudName={cloudName} uploadPreset={uploadPreset}/>;
}
