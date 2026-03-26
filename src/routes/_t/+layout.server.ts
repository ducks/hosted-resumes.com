import type { LayoutServerLoad } from './$types';
import { requireTenant } from '$lib/server/routing';
import { getUserByUsername } from '$lib/server/queries/users';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals }) => {
  const subdomain = requireTenant(locals);

  const user = await getUserByUsername(subdomain);
  if (!user) {
    throw error(404, 'User not found');
  }

  return {
    tenantUser: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    },
  };
};
