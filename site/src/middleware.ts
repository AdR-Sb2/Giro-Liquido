import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/ganhos",
  "/despesas",
  "/turnos",
  "/metas",
  "/veiculos",
  "/manutencoes",
  "/relatorios",
  "/configuracoes",
];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/entrar", request.url));
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    const onboardingCompleted = Boolean(profile?.onboarding_completed);

    if (pathname === "/onboarding" && onboardingCompleted) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname !== "/onboarding" && isProtected && !onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    if ((pathname === "/entrar" || pathname === "/cadastro") && user) {
      return NextResponse.redirect(
        new URL(onboardingCompleted ? "/dashboard" : "/onboarding", request.url),
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding",
    "/ganhos/:path*",
    "/despesas/:path*",
    "/turnos/:path*",
    "/metas/:path*",
    "/veiculos/:path*",
    "/manutencoes/:path*",
    "/relatorios/:path*",
    "/configuracoes/:path*",
    "/entrar",
    "/cadastro",
  ],
};
