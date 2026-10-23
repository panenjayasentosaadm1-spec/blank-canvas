import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/db-types";
import { getEpisodeThumbnailUrl } from "./list-image";
import type { Episode } from "./types";

type EpisodeRow = Database["public"]["Tables"]["episodes"]["Row"];

/**
 * Convert a database row into the Episode shape used by the UI.
 */
function mapEpisode(row: EpisodeRow): Episode {
  return {
    id: row.id,
    animeId: row.anime_id,
    number: row.number,
    title: row.title ?? "",
    embedUrl: row.embed_url ?? "",
    thumbnailUrl: getEpisodeThumbnailUrl(row.thumbnail_path),
    isPublished: row.is_published,
    publishedAt: row.published_at ?? "",
    updatedAt: row.updated_at,
  };
}

/** Published episodes of one anime, ordered by episode number. */
export async function listEpisodesByAnime(
  animeId: string,
): Promise<Episode[]> {
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("anime_id", animeId)
    .eq("is_published", true)
    .order("number", { ascending: true });

  if (error) {
    throw new Error(`Failed to load episodes: ${error.message}`);
  }

  return (data ?? []).map(mapEpisode);
}

/**
 * Semua episode yang dipublikasikan untuk banyak anime sekaligus,
 * dalam satu permintaan per kelompok id (menggantikan satu permintaan per anime).
 */
export async function listEpisodesForAnimes(
  animeIds: string[],
): Promise<Episode[]> {
  if (animeIds.length === 0) return [];

  const chunks: string[][] = [];
  for (let i = 0; i < animeIds.length; i += 100) {
    chunks.push(animeIds.slice(i, i + 100));
  }

  const responses = await Promise.all(
    chunks.map((chunk) =>
      supabase
        .from("episodes")
        .select("*")
        .eq("is_published", true)
        .in("anime_id", chunk)
        .order("number", { ascending: true }),
    ),
  );

  const episodes: Episode[] = [];
  for (const { data, error } of responses) {
    if (error) {
      throw new Error(`Failed to load episodes: ${error.message}`);
    }
    episodes.push(...(data ?? []).map(mapEpisode));
  }

  return episodes.sort((a, b) => a.number - b.number);
}

export async function getEpisode(
  animeId: string,
  number: number,
): Promise<Episode | null> {
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("anime_id", animeId)
    .eq("number", number)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load episode: ${error.message}`);
  }

  return data ? mapEpisode(data) : null;
}
