export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const configuredOauthPortalUrl =
    import.meta.env.VITE_OAUTH_PORTAL_URL?.trim() || "";

  // Local development may auto-fallback to a different port.
  // If no explicit auth portal is configured, use the current origin.
  const isLocalPortal = configuredOauthPortalUrl.startsWith("http://localhost") ||
    configuredOauthPortalUrl.startsWith("http://127.0.0.1") ||
    configuredOauthPortalUrl.startsWith("http://[::1]");

  const oauthPortalUrl =
    !configuredOauthPortalUrl || isLocalPortal
      ? window.location.origin
      : configuredOauthPortalUrl;

  const appId = import.meta.env.VITE_APP_ID || "dev-app-id";

  const redirectUri =
    import.meta.env.VITE_OAUTH_CALLBACK_URL ||
    `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  try {
    const url = new URL(`${oauthPortalUrl}/app-auth`);

    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.error("Invalid OAuth URL, using fallback", error);

    // fallback URL (prevents crash)
    return `${oauthPortalUrl}/app-auth?appId=${appId}&redirectUri=${encodeURIComponent(
      redirectUri
    )}&state=${state}&type=signIn`;
  }
};