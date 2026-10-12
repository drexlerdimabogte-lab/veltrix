/** Prefix an internal absolute path (e.g. "/work/tripyou.webp") with the deploy base path. External URLs pass through. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export function withBase(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${BASE_PATH}${path}`;
}
