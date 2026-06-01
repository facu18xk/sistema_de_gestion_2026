import { API_CONFIG } from "@/config/api";

type IdParam = { id: string };

const FALLBACK_PARAMS: IdParam[] = [{ id: "1" }];

function getItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown[] }).items)) {
    return (payload as { items: unknown[] }).items;
  }
  return [];
}

function getId(item: unknown, keys: string[]): string | null {
  if (!item || typeof item !== "object") return null;

  for (const key of keys) {
    const value = (item as Record<string, unknown>)[key];
    if (typeof value === "number" || typeof value === "string") {
      return String(value);
    }
  }

  return null;
}

export async function getStaticIdParams(endpoint: string, keys: string[]): Promise<IdParam[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || API_CONFIG.BASE_URL;
  const url = new URL(endpoint, baseUrl);

  url.searchParams.set("page", "1");
  url.searchParams.set("pageSize", "500");
  url.searchParams.set("Page", "1");
  url.searchParams.set("PageSize", "500");

  try {
    const response = await fetch(url, { next: { revalidate: false } });
    if (!response.ok) return FALLBACK_PARAMS;

    const ids = getItems(await response.json())
      .map((item) => getId(item, keys))
      .filter((id): id is string => Boolean(id));

    return ids.length > 0 ? ids.map((id) => ({ id })) : FALLBACK_PARAMS;
  } catch {
    return FALLBACK_PARAMS;
  }
}
