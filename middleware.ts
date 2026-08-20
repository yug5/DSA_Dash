import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    return new NextResponse('Missing Supabase environment variables', {
      status: 500,
    });
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options: CookieOptions;
        }>
      ) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Supabase auth error:', error.message);
  }

  const pathname = request.nextUrl.pathname;

  const protectedRoutes = [
    '/dashboard',
    '/practice',
    '/progress',
    '/goals',
    '/history',
    '/settings',
    '/onboarding',
  ];

  const authRoutes = ['/login', '/signup'];

  const isProtectedRoute =
    pathname === '/' ||
    protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isOnboardingRoute =
    pathname === '/onboarding' || pathname.startsWith('/onboarding/');

  // ── Unauthenticated user hitting a protected route → login ──
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // ── Authenticated user ──
  if (user) {
    // Already-logged-in user hitting login/signup → check onboarding first
    if (isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // Check onboarding status for all protected non-onboarding routes
    if (isProtectedRoute && !isOnboardingRoute) {
      // Read only the columns we need — keep middleware fast
      const { data: profileData } = await supabase
        .from('profiles')
        .select('onboarding_completed, dsa_experience')
        .eq('id', user.id)
        .maybeSingle();

      // Derive completion:
      // - explicit flag wins
      // - fall back to dsa_experience for pre-migration users
      const onboardingDone =
        profileData?.onboarding_completed === true ||
        profileData?.dsa_experience != null;

      if (!onboardingDone) {
        // New user — must complete onboarding before accessing the app
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding';
        return NextResponse.redirect(url);
      }
    }

    // Authenticated + already completed onboarding, but visiting /onboarding
    // → allow through. Users can re-run onboarding to upgrade/downgrade level
    // or change their daily target at any time.
    if (isOnboardingRoute) {
      // No redirect — let them reconfigure freely
      return response;
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};