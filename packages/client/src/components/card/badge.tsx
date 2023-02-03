import { component$, useStyles$ } from "@builder.io/qwik";
import type { BadgeInterface } from "~/types";
import styles from "./badge.css?inline";

export default component$((badge: BadgeInterface) => {
  useStyles$(styles);
  const filledClass = badge.filled ? "filled" : "";
  return <small class={`badge uppercase ${filledClass}`}>{badge.text}</small>;
});
