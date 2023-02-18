import type {
  SignInWithOAuthCredentials,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { client } from "./trpc";
import { Status } from "event-organiser-api-server/src/status.enum";

const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

export async function getUser() {
  const userResponse = await supabaseClient.auth.getUser();
  console.log(userResponse.data.user);
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
      });
    }
  }
  return userResponse;
}

export async function getUserData(email: string) {
  return await client.getUser.query({ email: email });
}

export async function resetPassword(email: string) {
  await supabaseClient.auth.resetPasswordForEmail(email);
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

export async function updateUserNotifications(
  email: string,
  checkbox: boolean
) {
  console.log(checkbox);
  await client.updateUser.mutate({
    params: {
      email: email,
    },
    body: {
      notifications: checkbox,
    },
  });
}
