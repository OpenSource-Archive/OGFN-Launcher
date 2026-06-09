export const API_ENDPOINTS = {
  auth: {
    token: "/account/api/oauth/token",
    verify: "/account/api/oauth/verify",
    exchange: "/account/api/oauth/exchange",
  },
  launcher: {
    status: "/launcher/status",
    news: "/launcher/news",
    trailer: "/launcher/trailer",
    builds: "/launcher/builds",
    commits: "/launcher/commits",
  },
} as const;
