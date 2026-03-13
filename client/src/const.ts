export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL — now points to the native login page instead of Manus OAuth.
export const getLoginUrl = (returnPath?: string) => {
  if (returnPath) {
    return `/login?returnPath=${encodeURIComponent(returnPath)}`;
  }
  return "/login";
};
