export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/((?!api/auth|verify|_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|workbox).*)"],
};
