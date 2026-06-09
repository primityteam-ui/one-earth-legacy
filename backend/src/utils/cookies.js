export function setRefreshCookie(res, token) {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
    domain: process.env.COOKIE_DOMAIN === "localhost" ? undefined : process.env.COOKIE_DOMAIN
  });
}

export function clearRefreshCookie(res) {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
    domain: process.env.COOKIE_DOMAIN === "localhost" ? undefined : process.env.COOKIE_DOMAIN
  });
}