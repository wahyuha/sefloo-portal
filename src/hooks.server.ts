// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Check if the route requires authentication
  if (event.url.pathname.startsWith('/products')) {
    const token = event.cookies.get('access_token');
    
    if (!token) {
      // Redirect to login if no token
      return Response.redirect(`${event.url.origin}/`);
    }
  }

  const response = await resolve(event);
  return response;
};