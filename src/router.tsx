import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { ResourceError } from "./components/ResourceState";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    defaultErrorComponent: ResourceError,
    context: { queryClient },
    scrollRestoration: true,
    // Preload halaman saat kursor di atas tautan agar navigasi terasa instan.
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
