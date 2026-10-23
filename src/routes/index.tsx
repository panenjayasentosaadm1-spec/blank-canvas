import { ResourceError, ResourceNotFound } from "@/components/ResourceState";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PosterCard, PosterGrid } from "@/components/PosterCard";
import { EpisodeCard } from "@/components/EpisodeCard";
import { PageSkeleton } from "@/components/PageSkeleton";
import { homeSectionsQuery, latestAnimeQuery, latestEpisodesQuery, type AnimeCardData } from "@/api/queries";
import { statusLabel, typeLabel } from "@/lib/format";
import { BannerAd } from "@/components/ads/AdSlots";

const HOME_LATEST_LIMIT = 15;

export const Route = createFileRoute("/")({
  // Store data lives in the browser; never render it on the server.
  ssr: false,
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.fetchQuery(latestEpisodesQuery),
      context.queryClient.fetchQuery(homeSectionsQuery),
      context.queryClient.fetchQuery(latestAnimeQuery),
    ]),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "UsagiNime — Episode anime, tertata rapi" },
      { name: "description", content: "Jelajahi serial anime dan tonton episode yang disematkan dari sumber resminya." },
      { property: "og:title", content: "UsagiNime" },
      { property: "og:description", content: "Jelajahi serial anime dan tonton episode yang disematkan." },
    ],
  }),
  pendingComponent: () => <PageSkeleton />,
  errorComponent: ResourceError,
  notFoundComponent: ResourceNotFound,
  component: Index,
});

function Index() {
  const { data: latest } = useSuspenseQuery(latestEpisodesQuery);
  const { data: sections } = useSuspenseQuery(homeSectionsQuery);
  const { data: newestAnime } = useSuspenseQuery(latestAnimeQuery);
  const newest = latest.slice(0, HOME_LATEST_LIMIT);
  const [firstRowSize, setFirstRowSize] = useState(2);
  useEffect(() => {
    const tablet = window.matchMedia("(min-width: 768px)");
    const desktop = window.matchMedia("(min-width: 1024px)");
    const update = () => setFirstRowSize(desktop.matches ? 4 : tablet.matches ? 3 : 2);
    update();
    tablet.addEventListener("change", update);
    desktop.addEventListener("change", update);
    return () => { tablet.removeEventListener("change", update); desktop.removeEventListener("change", update); };
  }, []);

  const newestAnimeCards: AnimeCardData[] = newestAnime.map((anime) => ({
    anime,
    imageUrl: anime.posterUrl || undefined,
  }));

  return (
    <SiteLayout>
      <BannerAd id="homepage_banner_1" />
      {newest.length === 0 ? null : (
        <section>
          <SectionHeading
            title="Episode Terbaru"
            subtitle="Episode anime yang paling baru diterbitkan."
            to="/terbaru"
            as="h1"
          />
          <PosterGrid>
            {newest.map((item, index) => <EpisodeCard key={item.id} item={item} loading={index < firstRowSize ? "eager" : "lazy"} />)}
          </PosterGrid>
        </section>
      )}

      <BannerAd id="homepage_banner_2" />

      <AnimeSection
        title="Anime Terbaru"
        className="mt-12"
        items={newestAnimeCards}
      />

      <AnimeSection
        title="Anime Ongoing"
        className="mt-12"
        to="/anime"
        search={{ status: "ongoing" }}
        items={sections.ongoing}
        badge="ONGOING"
      />

      <AnimeSection
        title="Movie"
        className="mt-12"
        search={{ type: "movie" }}
        items={sections.movies}
        badge="MOVIE"
      />

      <AnimeSection
        title="Tamat"
        className="mt-12"
        search={{ status: "completed" }}
        items={sections.completed}
        badge="TAMAT"
      />
    </SiteLayout>
  );
}

function AnimeSection({ title, className, to = "/anime", search, items, badge }: {
  title: string;
  className?: string;
  to?: "/anime" | "/terbaru";
  search?: { type?: string; status?: "ongoing" | "completed" };
  items: AnimeCardData[];
  badge?: string;
}) {
  // Sembunyikan seluruh bagian bila datanya benar-benar kosong.
  if (items.length === 0) return null;
  return (
    <section className={className}>
      <SectionHeading title={title} to={to} search={search} />
      <PosterGrid>
        {items.map(({ anime, imageUrl }) => (
          <Link key={anime.id} to="/anime/$slug" params={{ slug: anime.slug }} aria-label={anime.title}>
            <PosterCard
              title={anime.title}
              posterUrl={imageUrl}
              meta={`${typeLabel[anime.type]} • ${statusLabel[anime.status]}`}
              badge={badge ?? ""}
            />
          </Link>
        ))}
      </PosterGrid>
    </section>
  );
}

function SectionHeading({ title, subtitle, className, to = "/anime", search, as: Heading = "h2" }: {
  title: string;
  subtitle?: string;
  className?: string;
  to?: "/anime" | "/terbaru";
  search?: { type?: string; status?: "ongoing" | "completed" } | undefined;
  as?: "h1" | "h2";
}) {
  return (
    <div className={`mb-4 flex items-start justify-between gap-3 ${className ?? ""}`}>
      <div className="min-w-0">
        <Heading className="text-xl font-semibold">{title}</Heading>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <Link to={to} search={search ?? {}} className="shrink-0 pt-1 text-sm text-primary hover:underline">
        Lihat semua
      </Link>
    </div>
  );
}

