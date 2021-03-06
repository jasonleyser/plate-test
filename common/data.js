import * as Credentials from "~/common/credentials";
import * as Utilities from "~/common/utilities";
import * as Default from "~/common/default";

import DB from "~/db";
import JWT, { decode } from "jsonwebtoken";

const google = require("googleapis").google;
const OAuth2 = google.auth.OAuth2;

console.log("slate api data: ", Credentials.SLATE_API);

const runQuery = async ({ queryFn, errorFn, label }) => {
  let response;
  try {
    response = await queryFn();
  } catch (e) {
    response = errorFn(e);
  }

  console.log("[ database-query ]", { query: label });
  return response;
};

export const deleteUserById = async ({ id }) => {
  return await runQuery({
    label: "DELETE_USER_BY_ID",
    queryFn: async () => {
      const data = await DB.from("users").where({ id }).del();

      return 1 === data;
    },
    errorFn: async (e) => {
      return {
        error: "DELETE_USER_BY_ID",
        source: e,
      };
    },
  });
};

export const deleteUserFromOrganizationByUserId = async ({
  organizationId,
  userId,
}) => {
  return await runQuery({
    label: "DELETE_USER_FROM_ORGANIZATION_BY_USER_ID",
    queryFn: async () => {
      const o = await DB.select("*")
        .from("organizations")
        .where({ id: organizationId })
        .first();

      if (!o || !o.id) {
        return null;
      }

      if (o.data && o.data.ids && o.data.ids.length === 1) {
        const data = await DB.from("organizations")
          .where({ id: organizationId })
          .del();

        return 1 === data;
      }

      const data = await DB.from("organizations")
        .where("id", o.id)
        .update({
          data: {
            ...o.data,
            ids: o.data.ids.filter((each) => userId !== each),
          },
        })
        .returning("*");

      const index = data ? data.pop() : null;
      return index;
    },
    errorFn: async (e) => {
      return {
        error: "DELETE_USER_FROM_ORGANIZATION_BY_USER_ID",
        source: e,
      };
    },
  });
};

export const getOrganizationByUserId = async ({ id }) => {
  return await runQuery({
    label: "GET_ORGANIZATION_BY_USER_ID",
    queryFn: async () => {
      const hasUser = (userId) =>
        DB.raw(`?? @> ?::jsonb`, ["data", JSON.stringify({ ids: [userId] })]);

      const query = await DB.select("*")
        .from("organizations")
        .where(hasUser(id))
        .first();

      if (!query || query.error) {
        return null;
      }

      if (query.id) {
        return query;
      }

      return null;
    },
    errorFn: async (e) => {
      return {
        error: "GET_ORGANIZATION_BY_USER_ID",
        source: e,
      };
    },
  });
};

export const getViewer = async (req, existingToken = undefined) => {
  let viewer = null;

  try {
    let token = existingToken;
    if (!token) {
      token = Utilities.getToken(req);
    }

    let decode = JWT.verify(token, Credentials.JWT_SECRET);
    viewer = await getUserByEmail({ email: decode.email });
  } catch (e) {}

  if (!viewer || viewer.error) {
    viewer = null;
  }

  return { viewer };
};

export const getOrganizationByDomain = async ({ domain }) => {
  return await runQuery({
    label: "GET_ORGANIZATION_BY_DOMAIN",
    queryFn: async () => {
      const query = await DB.select("*")
        .from("organizations")
        .where({ domain })
        .first();

      if (!query || query.error) {
        return null;
      }

      if (query.id) {
        return query;
      }

      return null;
    },
    errorFn: async (e) => {
      return {
        error: "GET_ORGANIZATION_BY_DOMAIN",
        source: e,
      };
    },
  });
};

export const getUserByEmail = async ({ email }) => {
  return await runQuery({
    label: "GET_USER_BY_EMAIL",
    queryFn: async () => {
      const query = await DB.select("*").from("users").where({ email }).first();

      if (!query || query.error) {
        return null;
      }

      if (query.id) {
        return query;
      }

      return null;
    },
    errorFn: async (e) => {
      console.log(e);
      return {
        error: "GET_USER_BY_EMAIL",
        source: e,
      };
    },
  });
};

export const createOrganization = async ({ domain, data = {} }) => {
  return await runQuery({
    label: "CREATE_ORGANIZATION",
    queryFn: async () => {
      const query = await DB.insert({
        domain,
        data,
      })
        .into("organizations")
        .returning("*");

      const index = query ? query.pop() : null;
      return index;
    },
    errorFn: async (e) => {
      return {
        error: "CREATE_ORGANIZATION",
        source: e,
      };
    },
  });
};

export const createUser = async ({ email, password, salt, data = {} }) => {
  return await runQuery({
    label: "CREATE_USER",
    queryFn: async () => {
      const query = await DB.insert({
        email,
        password,
        salt,
        data,
      })
        .into("users")
        .returning("*");

      const index = query ? query.pop() : null;
      return index;
    },
    errorFn: async (e) => {
      console.log(e);
      return {
        error: "CREATE_USER",
        source: e,
      };
    },
  });
};

export const insertUploadData = async ({ user_id, object_id }) => {
  return await runQuery({
    label: "UPLOAD_DATA",
    queryFn: async () => {
      const query = await DB.insert({
        user_id,
        object_id,
      })
        .into("uploads")
        .returning("*");

      const index = query ? query.pop() : null;
      return index;
    },
    errorFn: async (e) => {
      console.log(e);
      return {
        error: "UPLOAD_DATA",
        source: e,
      };
    },
  });
};

export const getUploads = async ({ limit = Default.retrival.limit, sort }) => {
  console.log("limit: ", limit);
  return await runQuery({
    label: "GET_ALL_UPLOADS",
    queryFn: async () => {
      const query = await DB.select("*").from("uploads").limit(limit);
      return query;
    },
    errorFn: async (e) => {
      console.log(e);
      return {
        error: "GET_ALL_UPLOADS",
        source: e,
      };
    },
  });
};

export const getUserUploads = async ({ user_id, limit }) => {
  return await runQuery({
    label: "GET_USER_UPLOADS",
    queryFn: async () => {
      const query = await DB.select("*")
        .from("uploads")
        .where({ user_id: user_id })
        .orderBy("created_at", "desc")
        .limit(limit);
      return query;
    },
    errorFn: async (e) => {
      console.log(e);
      return {
        error: "GET_USER_UPLOADS",
        source: e,
      };
    },
  });
};

export const uploadToSlate = async (event, user_id, slate) => {
  console.log(Credentials.SLATE_API);
  //Upload an image and insert a db query
  let file = event.target.files[0];

  const url = "https://uploads.slate.host/api/public/" + slate_id;
  let data = new FormData();
  data.append("data", file);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + api,
    },
    body: data,
  });
  const json = await response.json();
  // NOTE: the URL to your asset will be available in the JSON response.
  console.log(json);

  let insert = await Actions.addToDatabase({
    user_id: user_id,
    object_id: json.data.cid,
    slate: slate_id,
  });
};
