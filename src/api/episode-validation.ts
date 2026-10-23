
import { z } from "zod";
import type { Episode } from "./types";
import { videoSourceError } from "@/lib/source-resolver";

export function videoLinkError(value: string): string | undefined {
  if (!value.trim()) return "Link sumber video wajib diisi.";
  const reason = videoSourceError(value);
  if (reason === "not-https") return "Link sumber video harus menggunakan HTTPS.";
  if (reason === "credentials") return "Link sumber video tidak boleh berisi nama pengguna atau kata sandi.";
  if (reason === "placeholder") return "Gunakan link sumber video asli, bukan placeholder.";
  return reason ? "Link sumber video tidak valid." : undefined;
}

export const episodeInputSchema = z.object({
  animeId: z.string().min(1, "Pilih anime terlebih dahulu."),
  number: z
    .number()
    .int("Nomor episode harus bilangan bulat.")
    .positive("Nomor episode minimal 1."),
  title: z.string().trim(),
  embedUrl: z.string().trim().superRefine((value, context) => {
    const message = videoLinkError(value);
    if (message) context.addIssue({ code: "custom", message });
  }),
  thumbnailUrl: z.string().optional(),
  isPublished: z.boolean(),
});

export type EpisodeInput = z.infer<typeof episodeInputSchema>;

export function nextEpisodeNumber(
  episodes: Episode[],
  animeId: string,
): number {
  return (
    episodes.reduce(
      (latest, episode) =>
        episode.animeId === animeId
          ? Math.max(latest, episode.number)
          : latest,
      0,
    ) + 1
  );
}
