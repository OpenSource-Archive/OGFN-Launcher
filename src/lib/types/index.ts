export interface User {
  accountId: string;
  displayName?: string;
  username?: string;
  email?: string;
  profilePicture?: string;
  banned: boolean;
  discordId?: string;
  role?: string;
}

export interface AthenaProfile {
  book_level: number;
  favorite_character: string;
}

export interface CommonCore {
  vBucks: number;
}

export interface AuthSession {
  token: string;
  user: User | null;
  athena: AthenaProfile | null;
  commonCore: CommonCore | null;
  hype: number | null;
}

export interface LauncherStatus {
  playersOnline: number;
  version: string;
  status: string;
}

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  image: string;
  date: string;
}

export interface Build {
  path: string;
  version: string;
  real: string;
  splash: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
