import type {
  SignInWithOAuthCredentials,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

export async function getUser() {
  return await supabaseClient.auth.getUser();
}

export async function resetPassword(email: string) {
  await supabaseClient.auth.resetPasswordForEmail(email);
}

export async function registerUser(credentials: SignUpWithPasswordCredentials) {
  const { data, error } = await supabaseClient.auth.signUp(credentials);
  if (error) {
    return { result: "failed" };
  }
  return { result: "success", data: data };
}

export async function loginUserWithProvider(
  credentials: SignInWithOAuthCredentials
) {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: credentials.provider,
  });
  if (error) {
    return { result: "failed" };
  }
  return { result: "success", data: data };
}

export async function loginUserWithPassword(
  credentials: SignInWithPasswordCredentials
) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword(
      credentials
    );
    if (error) {
      return { result: "failed" };
    }
    return { result: "success", data: data };
  } catch (error) {
    console.log(error);
  }
}

export async function logoutUser() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    return { result: "failed" };
  }

  return { result: "success" };
}
