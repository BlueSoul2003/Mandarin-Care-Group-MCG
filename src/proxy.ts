import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

export default createMiddleware(routing)

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root.
    "/",

    // Exclude API routes, framework assets, Vercel internals, and files.
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
}
