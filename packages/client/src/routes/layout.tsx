import {
  component$,
  Slot,
  useSignal,
  useClientEffect$,
  createContext,
  useContextProvider,
} from "@builder.io/qwik";
import type { Signal } from "@builder.io/qwik";
import { ProtectedHeader } from "~/components/header/protectedHeader";
import { PublicHeader } from "../components/header/publicHeader";

export const CTX = createContext<Signal<string>>("header-type");

export default component$(() => {
  const authTokenName: string = import.meta.env.VITE_AUTH_TOKEN;
  const user: Signal<string> = useSignal("");

  useContextProvider<Signal<string>>(CTX, user);

  useClientEffect$(({ track }) => {
    track(() => user.value);
    const authToken: string = localStorage.getItem(authTokenName) || "";
    user.value = authToken;
  });

  return (
    <>
      <main>
        <section>
          {user.value ? <ProtectedHeader /> : <PublicHeader />}
          <Slot />
        </section>
      </main>
    </>
  );
});
