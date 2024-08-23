
import {withAuth} from "@kinde-oss/kinde-auth-nextjs/middleware";

const publicroutes = ["/"];


const apiAuthPrefix = "/api/auth";

const DEFAULT_LOGIN_REDIRECT = "/dashboard";



export default function middleware(req) {
    const { nextUrl } = req;


  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicroutes.includes(nextUrl.pathname);


  if (isApiAuthRoute) {
    return null;
  }


  return withAuth(req, {
    isReturnToCurrentPage: true
  });
}




export const config = {
  matcher: ["/(api|trpc)(.*)", "/", "/:path*"],
};
