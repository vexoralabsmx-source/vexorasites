import { z } from "zod";

export const mediaAssetSchema = z.object({
  id: z.string(),
  publicId: z.string().min(1),
  secureUrl: z.string().url(),
  originalFilename: z.string().min(1),
  resourceType: z.enum(["image", "video"]),
  format: z.string().min(1),
  bytes: z.number().int().nonnegative().max(10 * 1024 * 1024),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  createdAt: z.string(),
});

export const createMediaAssetSchema = mediaAssetSchema.omit({ id: true, createdAt: true });

export type MediaAsset = z.infer<typeof mediaAssetSchema>;
export type CreateMediaAsset = z.infer<typeof createMediaAssetSchema>;
