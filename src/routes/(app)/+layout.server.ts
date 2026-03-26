import { redirect } from '@sveltejs/kit';
import { requireApp } from '$lib/server/routing';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
  requireApp(locals);
  if (!locals.user) {
    throw redirect(303, '/login');
  }
  return { user: locals.user };
};
