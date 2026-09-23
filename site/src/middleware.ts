import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/onboarding",
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
  let response = NextResponse.next({
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/entrar", request.url));
  }

  if ((pathname === "/entrar" || pathname === "/cadastro") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
