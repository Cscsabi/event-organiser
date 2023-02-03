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
  addLocationController,
  getCountriesController,
  getEventController,
  getEventsController,
  getLocationController,
  getLocationsController,
} from "./event/event.controller";
import {
  addEventInput,
  addLocationInput,
  getByIdInput,
} from "./event/event.schema";

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
  addLocation: t.procedure
    .input(addLocationInput)
    .mutation(({ input }) =>
      addLocationController({ addLocationInput: input })
    ),
  getCountries: t.procedure.query(() => getCountriesController()),
  // TODO: Add email parameter
  getLocations: t.procedure.query(() => getLocationsController()),
  getLocation: t.procedure
    .input(getByIdInput)
    .query(({ input }) => getLocationController({ getByIdInput: input })),
  getEvents: t.procedure.query(() => getEventsController()),
  getEvent: t.procedure
    .input(getByIdInput)
    .query(({ input }) => getEventController({ getByIdInput: input })),
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
