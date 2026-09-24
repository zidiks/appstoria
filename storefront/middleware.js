import { NextResponse } from 'next/server';
import { FEATURES } from '~/site.config';

// Пока блог выключен в site.config.js — временно уводим с него на главную
export function middleware(request) {
  if (!FEATURES.blog) {
    return NextResponse.redirect(new URL('/', request.url), 302);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/blog', '/blog/:path*'],
};
