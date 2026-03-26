// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { RouteContext } from '$lib/server/routing';
import type { TierConfig } from '$lib/tier';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: {
        id: string;
        email: string;
        username: string;
        tier: string;
      } | null;
      route: RouteContext;
      tierConfig: TierConfig;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
