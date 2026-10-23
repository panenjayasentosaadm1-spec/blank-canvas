import { Link } from "@tanstack/react-router";
import { SafeImage } from "@/components/SafeImage";
import type { Episode } from "@/api/types";

/**
 * Episode selection grid shown on the episode watch page.
 * Renders only the episodes passed in (already scoped to the current anime),
 * sorted ascending by number, with the currently playing episode highlighted.
 */
export function EpisodeGrid({ slug, episodes, posterUrl, animeTitle, currentEpisodeId }: { slug: string; episodes: Episode[]; posterUrl: string; animeTitle: string; currentEpisodeId: string }) {
  const published = episodes.filter((episode) => episode.isPublished).sort((a, b) => a.number - b.number);
  if (published.length === 0) return null;
  return <section className="mt-3.5 border-t border-border/60 pt-3.5 md:mt-5 md:pt-5">
    <h2 className="mb-3 text-lg font-semibold md:text-xl">Daftar Episode</h2>
    <ul className="grid grid-cols-3 gap-2.5 md:gap-3">
      {published.map((episode) => {
        const isCurrent = episode.id === currentEpisodeId;
        return <li key={episode.id}>
          <Link to="/anime/$slug/episode/$number" params={{ slug, number: String(episode.number) }} aria-current={isCurrent ? "page" : undefined} className="group block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className={isCurrent ? "relative overflow-hidden rounded-md border border-primary ring-2 ring-primary" : "relative overflow-hidden rounded-md border border-border transition-colors group-hover:border-primary"}>
              <SafeImage src={episode.thumbnailUrl || posterUrl} alt={`Episode ${episode.number} ${animeTitle}`} loading="lazy" className="aspect-video w-full object-cover" />
              <span className="absolute bottom-1 left-1 rounded-sm bg-background/90 px-1.5 py-0.5 text-[11px] font-semibold leading-tight text-foreground md:text-xs">Ep {episode.number}</span>
              {isCurrent && <span className="absolute right-1 top-1 rounded-sm bg-primary px-1.5 py-0.5 text-[11px] font-medium leading-tight text-primary-foreground md:text-xs">Sedang ditonton</span>}
            </div>
            <p className={isCurrent ? "mt-1.5 line-clamp-1 text-xs font-medium text-primary md:text-sm" : "mt-1.5 line-clamp-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground md:text-sm"}>{episode.title || `Episode ${episode.number}`}</p>
          </Link>
        </li>;
      })}
    </ul>
  </section>;
}
