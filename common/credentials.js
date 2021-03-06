if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const PASSWORD_SECRET = process.env.PASSWORD_SECRET;
export const REDIRECT_URIS = process.env.REDIRECT_URIS;
export const JWT_SECRET = process.env.JWT_SECRET;
export const SLATE_API = process.env.SLATE_API;
export const SLATE_PRIVATE = process.env.SLATE_PRIVATE;
export const SLATE_PUBLIC = process.env.SLATE_PUBLIC;
