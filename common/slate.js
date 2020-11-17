import * as Credentials from "~/credentials";
import * as Actions from "~/common/actions";
import * as Constants from "~/common/constants";
import * as Utilities from "~/common/utilities";

export const Upload = async (event, user_id, slate) => {
  //Upload an image and insert a db query
  let file = event.target.files[0];
  let slate_id = Credentials.SLATE_PRIVATE;
  let api = Credentials.SLATE_API;

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
