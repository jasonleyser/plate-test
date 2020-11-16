import * as Credentials from "~/common/credentials";
import * as Data from "~/common/data";

const google = require("googleapis").google;
const OAuth2 = google.auth.OAuth2;

export default async (req, res, app) => {
  const client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    Credentials.REDIRECT_URIS
  );

  const googleURL = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/user.organization.read",
    ],
    prompt: "consent",
  });

  const { viewer } = await Data.getViewer(req);
  let allUploads = await Data.getUploads({ limit: 4 });

  if (!viewer || viewer.error) {
    return app.render(req, res, "/", { googleURL, viewer: null, allUploads });
  }

  app.render(req, res, "/", { googleURL, viewer, allUploads });
};
