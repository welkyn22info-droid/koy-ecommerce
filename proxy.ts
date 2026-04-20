import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Validate JWT server-side (never use getSession in middleware)
  const { data: { user } } = await supabase.auth.getUser()

  // Block unauthenticated access to confirmation page
  const { pathname } = request.nextUrl

  // Bold webhook is public (receives from Bold servers)
  if (pathname.startsWith("/api/bold/webhook")) {
    return response
  }

  // bold/link and bold/verify require auth
  if (pathname.startsWith("/api/bold/link") || pathname.startsWith("/api/bold/verify")) {
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
