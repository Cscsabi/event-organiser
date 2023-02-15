import "./load.env";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { PrismaClient } from "@prisma/client";
import {
  createUserSchema,
  filterQuery,
  params,
  updateUserSchema,
} from "./user/user.schema";
import {
  createUserController,
  deleteUserController,
  findAllUsersController,
  findUserController,
  updateUserController,
} from "./user/user.controller";
import SuperJSON from "superjson";
import {
  addEventController,
  deleteEventController,
  getCountriesController,
  getEventController,
  getEventsController,
  updateEventController,
} from "./event/event.controller";
import { addEventInput, updateEventInput } from "./event/event.schema";
import {
  addLocationInput,
  updateLocationInput,
} from "./location/location.schema";
import { byIdInput, getByEmailInput } from "./general/general.schema";
import {
  addLocationController,
  deleteLocationController,
  getLocationController,
  getLocationsController,
  updateLocationController,
} from "./location/location.controller";
import {
  addGuestInput,
  deleteGuestInput,
  getGuestInput,
  updateGuestInput,
  guestEventInput,
  addGuestAndConnectToEventInput,
} from "./guest/guest.schema";
import {
  addGuestAndConnectToEventController,
  addGuestController,
  deleteEventGuestController,
  deleteGuestController,
  getGuestController,
  getGuestsController,
  updateGuestController,
} from "./guest/guest.controller";

export const prisma = new PrismaClient();
const t = initTRPC.create({
  transformer: SuperJSON,
});

const appRouter = t.router({
  createUser: t.procedure
    .input(createUserSchema)
    .mutation(({ input }) => createUserController({ input })),
  updateUser: t.procedure
    .input(updateUserSchema)
    .mutation(({ input }) =>
      updateUserController({ paramsInput: input.params, input: input.body })
    ),
  deleteUser: t.procedure
    .input(params)
    .mutation(({ input }) => deleteUserController({ paramsInput: input })),
  getUser: t.procedure
    .input(params)
    .query(({ input }) => findUserController({ paramsInput: input })),
  getUsers: t.procedure
    .input(filterQuery)
    .query(({ input }) => findAllUsersController({ filterQuery: input })),
  addEvent: t.procedure
    .input(addEventInput)
    .mutation(({ input }) => addEventController({ addEventInput: input })),
  updateEvent: t.procedure
    .input(updateEventInput)
    .mutation(({ input }) =>
      updateEventController({ updateEventInput: input })
    ),
  deleteEvent: t.procedure
    .input(byIdInput)
    .mutation(({ input }) => deleteEventController({ deleteInput: input })),
  getEvents: t.procedure
    .input(getByEmailInput)
    .query(({ input }) => getEventsController({ getByEmailInput: input })),
  getEvent: t.procedure
    .input(byIdInput)
    .query(({ input }) => getEventController({ getByIdInput: input })),
  getGuests: t.procedure
    .input(getByEmailInput)
    .query(({ input }) => getGuestsController({ getByEmailInput: input })),
  getGuest: t.procedure
    .input(getGuestInput)
    .query(({ input }) => getGuestController({ getGuestInput: input })),
  createGuest: t.procedure
    .input(addGuestInput)
    .mutation(({ input }) => addGuestController({ addGuestInput: input })),
  createGuestAndConnectToEvent: t.procedure
    .input(addGuestAndConnectToEventInput)
    .mutation(({ input }) =>
      addGuestAndConnectToEventController({
        addGuestAndConnectToEventInput: input,
      })
    ),
  updateGuest: t.procedure
    .input(updateGuestInput)
    .mutation(({ input }) =>
      updateGuestController({ updateGuestInput: input })
    ),
  deleteGuest: t.procedure
    .input(deleteGuestInput)
    .mutation(({ input }) =>
      deleteGuestController({ deleteGuestInput: input })
    ),
  deleteEventGuest: t.procedure
    .input(guestEventInput)
    .mutation(({ input }) =>
      deleteEventGuestController({ deleteEventGuestInput: input })
    ),
  addLocation: t.procedure
    .input(addLocationInput)
    .mutation(({ input }) =>
      addLocationController({ addLocationInput: input })
    ),
  updateLocation: t.procedure
    .input(updateLocationInput)
    .mutation(({ input }) =>
      updateLocationController({ updateLocationInput: input })
    ),
  deleteLocation: t.procedure
    .input(byIdInput)
    .mutation(({ input }) =>
      deleteLocationController({ deleteLocationInput: input })
    ),
  getLocations: t.procedure
    .input(getByEmailInput)
    .query(({ input }) => getLocationsController({ getByEmailInput: input })),
  getLocation: t.procedure
    .input(byIdInput)
    .query(({ input }) => getLocationController({ getByIdInput: input })),
  getCountries: t.procedure.query(() => getCountriesController()),
});

export type AppRouter = typeof appRouter;

const app = express();
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
  })
);

const port = 8000;
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
