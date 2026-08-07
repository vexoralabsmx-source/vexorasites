export function optimizeCloudinaryImage(url: string) {
  if (!url || typeof url !== "string") return "";
  if (!url.startsWith("https://res.cloudinary.com/") || !url.includes("/image/upload/")) return url;
  if (url.includes("/image/upload/f_auto,q_auto/")) return url;
  return url.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
}
