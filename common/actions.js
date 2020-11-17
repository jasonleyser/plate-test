import "isomorphic-fetch";

import Cookies from "universal-cookie";

import * as Constants from "~/common/constants";
import * as Credentials from "~/common/credentials";

const cookies = new Cookies();

const REQUEST_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

const SERVER_PATH = "";

const getHeaders = () => {
  const jwt = cookies.get(Constants.session.key);

  if (jwt) {
    return {
      ...REQUEST_HEADERS,
      authorization: `Bearer ${jwt}`,
    };
  }

  return REQUEST_HEADERS;
};

export const onDeleteViewer = async (e) => {
  const options = {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({}),
  };

  const response = await fetch(`${SERVER_PATH}/api/users/delete`, options);
  const json = await response.json();

  if (json.error) {
    console.log(json.error);
    return;
  }

  window.location.href = "/";
};

export const onLocalSignIn = async (e, props, auth) => {
  const options = {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({
      ...auth,
    }),
  };

  const response = await fetch(`${SERVER_PATH}/api/sign-in`, options);
  const json = await response.json();

  if (json.error) {
    console.log(json.error);
    return;
  }

  if (json.token) {
    cookies.set(Constants.session.key, json.token);
  }

  window.location.href = "/sign-in-success";
};
//
//
//ADD UPLOAD DATA TO THE POSTGRES
export const addToDatabase = async (data) => {
  console.log("[ fetching api ]");
  const options = {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({ user_id: data.user_id, object_id: data.object_id }),
  };

  const response = await fetch(`${SERVER_PATH}/api/upload-image`, options);
  const json = await response.json();
  console.log(json);
  if (json.error) {
    console.log(json.error);
    return;
  }
  console.log("[ fetching done ]");
};
//
//
//
export const Upload = async (event, user_id, slate) => {
  console.log(Credentials.SLATE_API);
  let slate_id = Credentials.SLATE_PRIVATE;
  let api = Credentials.SLATE_API;
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
