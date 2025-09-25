import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Define protected routes that require authentication
  const protectedRoutes = [
    '/admin',
    '/seller',
    '/tickets',
    '/event/[id]/purchase'
  ];
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth',
    '/auth/callback',
    '/about-us',
    '/cancellation-refund-policy',
    '/pricing-policy',
    '/privacy-policy',
    '/terms-and-conditions',
    '/search'
  ];
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => {
    if (route.includes('[id]')) {
      // Handle dynamic routes like /event/[id]/purchase
      return pathname.startsWith(route.replace('[id]', '').replace('//', '/'));
    }
    return pathname.startsWith(route);
  });
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));
  
  // If it's a protected route, check for authentication
  if (isProtectedRoute) {
    // Check for token in cookies or headers
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/auth', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};