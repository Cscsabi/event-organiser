import { component$ } from "@builder.io/qwik";
import Card from "~/components/card/card";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";

export default component$(() => {
  const navigate = useNavigate();
  return (
    <div>
      <button onClick$={() => (navigate.path = paths.newEvent)}>
        Create new Event
      </button>
      <button onClick$={() => (navigate.path = paths.newLocation)}>
        Add new Location
      </button>
      <Card
        title="Test"
        body="TESTESTESTESTESTEST"
        btn={{ text: "read", href: "/", type: "primary", filled: true }}
        badge={{ text: "New Test", filled: false }}
      ></Card>
    </div>
  );
});
