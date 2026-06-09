export interface AuthUser {
  accountId: string;
  displayName?: string;
  username?: string;
  banned: boolean;
  email: string;
  profilePicture?: string;
  discordId: string;
  roles: string[];
}

export interface AthenaProfile {
  favorite_character: string;
  xp: number;
  level: number;
  book_level: number;
}

export interface CommonCore {
  vBucks: number;
}

export interface AuthResponse {
  user: AuthUser;
  athena: AthenaProfile;
  hype: string;
  common_core: CommonCore;
}

export interface ResponseOrError<T> {
  success: boolean;
  data: T;
}
