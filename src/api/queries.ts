
import { queryOptions } from "@tanstack/react-query";
import {
  getAnimeBySlug,
  listAnime,
  listAnimeShared,
  listLatestAnime,
  type AnimeFilter,
} from "./anime";
import { getEpisode, listEpisodesByAnime, listEpisodesForAnimes } from "./episodes";
import { getLatestThumbnailsByAnime } from "./list-image";
import { getSettings } from "./settings";
import { listTags } from "./tags";
import type { Anime } from "./types";

export interface AnimeCardData {
  anime: Anime;
  imageUrl: string | undefined;
}

export interface EpisodeCardData {
  id: string;
  anime: Anime;
  number: number;
  publishedAt: string;
  imageUrl: string | undefined;
}

async function toAnimeCards(list: Anime[]): Promise<AnimeCardData[]> {
  const thumbnails = await getLatestThumbnailsByAnime(list.map((anime) => anime.id));
  return list.map((anime) => ({
    anime,
    imageUrl: (thumbnails.get(anime.id) ?? anime.posterUrl) || undefined,
  }));
}

/** Kartu yang selalu memakai poster anime, bukan thumbnail episode. */
export function toPosterCards(list: Anime[]): AnimeCardData[] {
  return list.map((anime) => ({
    anime,
    imageUrl: anime.posterUrl || undefined,
  }));
}

function publishedTime(iso: string): number {
  const time = Date.parse(iso);
  return Number.isNaN(time) ? 0 : time;
}

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: getSettings,
  staleTime: 5 * 60_000,
});

export const tagsQuery = queryOptions({
  queryKey: ["tags"],
  queryFn: listTags,
  staleTime: 5 * 60_000,
});

export const latestAnimeQuery = queryOptions({
  queryKey: ["anime", "latest"],
  staleTime: 5 * 60_000,
  queryFn: () => listLatestAnime(10),
});

export const animeListQuery = (filter: AnimeFilter) =>
  queryOptions({
    queryKey: ["anime", "list", filter],
    staleTime: 5 * 60_000,
    queryFn: () => listAnime(filter),
  });

export const animeCardsQuery = (filter: AnimeFilter) =>
  queryOptions({
    queryKey: ["anime", "cards", filter],
    staleTime: 5 * 60_000,
    queryFn: async () => toAnimeCards(await listAnime(filter)),
  });

export const homeSectionsQuery = queryOptions({
  queryKey: ["home", "sections"],
  staleTime: 5 * 60_000,
  queryFn: async () => {
    const published = await listAnimeShared();

    const movies = published
      .filter((anime) => anime.type === "movie")
      .slice(0, 10);

    const completed = published
      .filter((anime) => anime.status === "completed")
      .slice(0, 10);

    const ongoing = published
      .filter((anime) => anime.status === "ongoing")
      .slice(0, 10);

    const [movieCards, completedCards, ongoingCards] = await Promise.all([
      toAnimeCards(movies),
      Promise.resolve(toPosterCards(completed)),
      Promise.resolve(toPosterCards(ongoing)),
    ]);

    return {
      movies: movieCards,
      completed: completedCards,
      ongoing: ongoingCards,
    };
  },
});

export const latestEpisodesQuery = queryOptions({
  queryKey: ["episodes", "latest"],
  staleTime: 5 * 60_000,
  queryFn: async (): Promise<EpisodeCardData[]> => {
    const series = (await listAnimeShared()).filter(
      (anime) => anime.type !== "movie",
    );

    if (series.length === 0) return [];

    const seriesById = new Map(series.map((anime) => [anime.id, anime]));
    const episodes = await listEpisodesForAnimes(series.map((anime) => anime.id));

    return episodes
      .flatMap((episode) => {
        const anime = seriesById.get(episode.animeId);
        if (!anime) return [];
        return [{
          id: episode.id,
          anime,
          number: episode.number,
          publishedAt: episode.publishedAt,
          imageUrl: episode.thumbnailUrl || anime.posterUrl || undefined,
        }];
      })
      .sort(
        (a, b) =>
          publishedTime(b.publishedAt) - publishedTime(a.publishedAt) ||
          b.number - a.number,
      );
  },
});

export const animeDetailQuery = (slug: string) =>
  queryOptions({
    queryKey: ["anime", "detail", slug],
    staleTime: 5 * 60_000,
    queryFn: () => getAnimeBySlug(slug),
  });

export const episodesQuery = (animeId: string) =>
  queryOptions({
    queryKey: ["episodes", animeId],
    staleTime: 5 * 60_000,
    queryFn: () => listEpisodesByAnime(animeId),
  });

export const episodeQuery = (animeId: string, number: number) =>
  queryOptions({
    queryKey: ["episodes", animeId, number],
    staleTime: 5 * 60_000,
    queryFn: () => getEpisode(animeId, number),
  });
