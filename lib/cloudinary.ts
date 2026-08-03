export function optimizeCloudinaryImage(url: string) {
  if (!url.startsWith("https://res.cloudinary.com/") || !url.includes("/image/upload/")) return url;
  return url.replace("/image/upload/", "/image/upload/f_auto,q_auto/" );
}
