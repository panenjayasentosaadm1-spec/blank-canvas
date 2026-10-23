import { beforeEach, expect, it, vi } from "vitest";
import { saveAnime } from "@/api/admin";
import { animeInputSchema, slugify, type AnimeInput } from "@/api/admin-validation";

const { from, storageFrom, upload, responses, calls, signedUrl } = vi.hoisted(() => ({
  from: vi.fn(), storageFrom: vi.fn(), upload: vi.fn(), signedUrl: vi.fn(),
  responses: [] as Array<{ data: unknown; error: unknown }>,
  calls: [] as Array<{ table: string; method: string; args: unknown[] }>,
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from, storage: { from: storageFrom } } }));
const input: AnimeInput = { title: "Anime uji", slug: "anime-uji", synopsis: "", posterUrl: "", type: "tv", status: "ongoing", season: "", year: 2026, tagIds: [], isPublished: false };
const row = { id: "a1", title: input.title, slug: input.slug, poster_path: null, type: "tv", status: "ongoing", is_published: false, created_at: "2026-10-22", updated_at: "2026-10-22" };
function ok(data: unknown) { responses.push({ data, error: null }); }
beforeEach(() => {
  vi.clearAllMocks(); responses.length = 0; calls.length = 0;
  upload.mockResolvedValue({ data: {}, error: null });
  signedUrl.mockImplementation((path: string) => Promise.resolve({ data: { signedUrl: `https://storage.test/storage/v1/object/sign/posters/${path}?token=temporary` }, error: null }));
  storageFrom.mockImplementation((bucket: string) => ({ upload, createSignedUrl: signedUrl, getPublicUrl: (path: string) => ({ data: { publicUrl: `https://storage.test/storage/v1/object/public/${bucket}/${path}` } }) }));
  from.mockImplementation((table: string) => {
    const response = responses.shift();
    if (!response) throw new Error(`Unexpected request: ${table}`);
    const chain: Record<string, unknown> = {};
    for (const method of ["select", "eq", "neq", "in", "maybeSingle", "single", "insert", "update", "delete"]) chain[method] = (...args: unknown[]) => { calls.push({ table, method, args }); return chain; };
    chain["then"] = (resolve: (value: unknown) => unknown) => Promise.resolve(response).then(resolve);
    return chain;
  });
});
it("uploads optimized WebP to the existing posters bucket and stores an object path", async () => {
  ok(null); ok({ ...row, poster_path: "anime/upload.webp" }); ok(null);
  const saved = await saveAnime({ ...input, posterUrl: "data:image/webp;base64,UklGRg==" });
  expect(storageFrom).toHaveBeenCalledWith("posters");
  const [path, blob, options] = upload.mock.calls[0] ?? [];
  expect(path).toMatch(/^anime\/.+\.webp$/);
  expect(blob.type).toBe("image/webp");
  expect(options).toMatchObject({ contentType: "image/webp", upsert: false });
  expect(calls.find(c => c.method === "insert")?.args[0]).toMatchObject({ poster_path: path });
  expect(saved.posterUrl).toContain("/public/posters/anime/upload.webp");
});
it.each(["public", "sign"])("keeps the unchanged %s Storage image path without a duplicate upload", async (access) => {
  ok(row); ok(null); ok({ ...row, poster_path: "anime/old.webp" }); ok(null);
  await saveAnime({ ...input, posterUrl: `https://storage.test/storage/v1/object/${access}/posters/anime/old.webp?token=temporary` }, "a1");
  expect(upload).not.toHaveBeenCalled();
  expect(calls.find(c => c.method === "update")?.args[0]).toMatchObject({ poster_path: "anime/old.webp" });
});
it("preserves external URLs even if their path resembles a Storage object", async () => {
  const posterUrl = "https://external.test/storage/v1/object/public/posters/external.webp";
  ok(row); ok(null); ok({ ...row, poster_path: posterUrl }); ok(null);
  await saveAnime({ ...input, posterUrl }, "a1");
  expect(upload).not.toHaveBeenCalled();
  expect(calls.find(c => c.method === "update")?.args[0]).toMatchObject({ poster_path: posterUrl });
});
it("replaces the image with one upload while keeping existing deletion behavior", async () => {
  ok(row); ok(null); ok({ ...row, poster_path: "anime/new.webp" }); ok(null);
  await saveAnime({ ...input, posterUrl: "data:image/webp;base64,UklGRg==" }, "a1");
  expect(upload).toHaveBeenCalledTimes(1);
  expect(calls.find(c => c.method === "update")?.args[0]).toMatchObject({ poster_path: upload.mock.calls[0]?.[0] });
});
it("clears the image reference without uploading", async () => {
  ok(row); ok(null); ok(row); ok(null);
  await saveAnime(input, "a1");
  expect(upload).not.toHaveBeenCalled();
  expect(calls.find(c => c.method === "update")?.args[0]).toMatchObject({ poster_path: null });
});
it("reports upload errors before writing anime data", async () => {
  ok(null); upload.mockResolvedValue({ error: { message: "permission denied" } });
  await expect(saveAnime({ ...input, posterUrl: "data:image/webp;base64,UklGRg==" })).rejects.toThrow("permission denied");
  expect(calls.some(c => c.method === "insert" || c.method === "update")).toBe(false);
});
it("keeps optional metadata, genre relations and publication values", async () => {
  ok(null); ok([{ id: "g1" }]); ok({ ...row, is_published: true, alt_title: "Alternatif", rating: 0 }); ok(null); ok(null);
  const saved = await saveAnime({ ...input, altTitle: "Alternatif", rating: 0, tagIds: ["g1"], isPublished: true });
  expect(saved).toMatchObject({ altTitle: "Alternatif", rating: 0, tagIds: ["g1"], isPublished: true });
  expect(calls.find(c => c.table === "anime_tags" && c.method === "insert")?.args[0]).toEqual([{ anime_id: "a1", tag_id: "g1" }]);
});
it("retains slug and inclusive rating validation", () => {
  expect(slugify("  Kisah Épisode: Baru!  ")).toBe("kisah-episode-baru");
  for (const rating of [undefined, 0, 10]) expect(animeInputSchema.safeParse({ ...input, rating }).success).toBe(true);
  for (const rating of [-0.1, 10.1]) expect(animeInputSchema.safeParse({ ...input, rating }).success).toBe(false);
});