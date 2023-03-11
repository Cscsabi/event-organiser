import type {
  SignInWithOAuthCredentials,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  UserAttributes,
} from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { client } from "./trpc";
import { Status } from "event-organiser-api-server/src/status.enum";
// import { Client, SendEmailV3_1, LibraryResponse } from "node-mailjet";

const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

// TODO:
// const mailjet = new Client({
//   apiKey: import.meta.env.API_KEY,
//   apiSecret: import.meta.env.API_SECRET,
//   config: { host: "api.mailjet.com", version: "v3", output: "text" },
//   options: {
//     timeout: 1000,
//     maxBodyLength: 1500,
//     maxContentLength: 100,
//     headers: {
//       "X-API-Key": "foobar",
//     },
//     proxy: {
//       protocol: "http",
//       host: "www.test-proxy.com",
//       port: 3100,
//     },
//   },
// });

// export async function sendEmail(
//   subject: string,
//   text: string,
//   html: string,
//   email: string
// ) {
//   const request = await mailjet.post("send", { version: "v3.1" }).request({
//     Messages: [
//       {
//         From: {
//           Email: "cscsabi2001@gmail.com",
//           Name: "Csizmadia Csaba",
//         },
//         To: [
//           {
//             Email: email,
//             Name: "teszt",
//           },
//         ],
//         Subject: subject,
//         TextPart: text,
//         HTMLPart: html,
//       },
//     ],
//   });

//   console.log(request.body);
//   console.log(request.response);
// }

export async function getUser() {
  const userResponse = await supabaseClient.auth.getUser();
  if (userResponse.data.user?.email) {
    const result = await client.getUser.query({
      email: userResponse.data.user.email,
    });
    if (result.status === Status.NOT_FOUND) {
      const firstName = userResponse.data.user.user_metadata.name.split(" ")[0];
      const lastName = userResponse.data.user.user_metadata.name.split(" ")[1];
      await client.createUser.mutate({
        email: userResponse.data.user.email,
        firstname: firstName,
        lastname: lastName,
        darkModeEnabled: false,
      });
    }
  }
  return userResponse;
}

export function getUserData(email: string) {
  return client.getUser.query({ email: email });
}

// export function test() {
//   sendEmail(
//     "teszt",
//     "teszt",
//     "<div>teszt</div>",
//     "csaba.csizmadia2001@gmail.com"
//   );
// }

export async function changePassword(attributes: UserAttributes) {
  const userResponse = await supabaseClient.auth.updateUser(attributes);
  // if (!userResponse.error) {
  //   sendEmail(
  //     "teszt",
  //     "teszt",
  //     "<div>teszt</div>",
  //     "csaba.csizmadia2001@gmail.com"
  //   );
  // }
}

export async function registerUser(credentials: SignUpWithPasswordCredentials) {
  const { data, error } = await supabaseClient.auth.signUp(credentials);
  if (error) {
    return { result: Status.FAILED };
  }
  return { result: Status.SUCCESS, data: data };
}

export async function loginUserWithProvider(
  credentials: SignInWithOAuthCredentials
) {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: credentials.provider,
  });
  if (error) {
    return { result: Status.FAILED };
  }
  return { result: Status.SUCCESS, data: data };
}

export async function loginUserWithPassword(
  credentials: SignInWithPasswordCredentials
) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword(
      credentials
    );
    if (error) {
      return { result: Status.FAILED };
    }
    return { result: Status.SUCCESS, data: data };
  } catch (error) {
    console.log(error);
  }
}

export async function logoutUser() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    return { result: Status.FAILED };
  }

  return { result: Status.SUCCESS };
}
