import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { client } from "~/utils/trpc";

export default component$(() => {
  const { params } = useLocation();

  console.log(params);
  return <div>Example: {params.locationId}</div>;
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const result = await client.getCountries.query();
  return {
    params: result.countries.map((country) => {
      const id = country.id.toString();
      return {
        id,
      };
    }),
  };
};
