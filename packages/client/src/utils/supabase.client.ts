import type {
  SignInWithOAuthCredentials,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { client } from "./trpc";
import { Status } from "event-organiser-api-server/src/status.enum";
import { sendEmail } from "./common.functions";
import type { UserAttributes } from "./types";

const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

export async function getSession() {
  const session = (await supabaseClient.auth.getSession()).data.session;
  if (session?.user.email !== undefined) {
    const result = await client.getUser.query({
      email: session.user.email,
    });
    if (result.status === Status.NOT_FOUND) {
      let firstName = "";
      let lastName = "";
      if (session.user?.user_metadata.name !== undefined) {
        firstName = session.user?.user_metadata.name.split(" ")[0];
        lastName = session.user?.user_metadata.name.split(" ")[1];
      }
      await client.createUser.mutate({
        email: session.user.email,
        firstname: firstName,
        lastname: lastName,
        darkModeEnabled: false,
      });
    }
  }
  return session;
}

export function getUserData(email: string) {
  return client.getUser.query({ email: email });
}

export async function changePassword(attributes: UserAttributes) {
  const userResponse = await supabaseClient.auth.updateUser(attributes);
  if (!userResponse.error) {
    sendEmail({
      text: attributes.sendEmailInput.text,
      subject: attributes.sendEmailInput.subject,
      html: attributes.sendEmailInput.html,
      recieverEmail: attributes.sendEmailInput.recieverEmail,
      recieverName: attributes.sendEmailInput.recieverName,
    });
  }
  return userResponse;
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
