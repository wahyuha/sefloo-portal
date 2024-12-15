// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/products')) {
    const token = event.cookies.get('access_token');
    
    if (!token) {
      return Response.redirect(`${event.url.origin}/`);
    }

    try {
      // Verify token validity
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/portal/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // If token is invalid, remove it and redirect
        event.cookies.delete('access_token', { path: '/' });
        return Response.redirect(`${event.url.origin}/`);
      }
    } catch (error) {
      // If request fails, redirect to login
      return Response.redirect(`${event.url.origin}/`);
    }
  }

  const response = await resolve(event);
  return response;
};