import type { JSX } from "@builder.io/qwik/jsx-runtime";
import type { EventType, Location, Event } from "@prisma/client";

export interface BadgeInterface {
  text: string;
  filled?: boolean;
}

export interface ButtonInterface {
  text: string;
  type: string;
  href: string;
  filled?: boolean;
  icon?: JSX.Element;
}

export interface CardInterface {
  indicator?: string;
  badge?: BadgeInterface;
  image?: string;
  title: string;
  subtitle?: string;
  body: string;
  btn: ButtonInterface;
}

export interface EventInterface {
  name: string;
  email: string;
  type: EventType;
  date: Date;
  budget: number;
  locationId: string;
  headcount: number;
}

export interface LocationInterface {
  email: string;
  name: string;
  description: string;
  addressId: string;
  city: string;
  countryId: number;
  street: string;
  state: string;
  zipCode: number;
  type: string;
  price: number;
  phone: string;
  link: string;
}

export interface GetLocationsReturnType {
  status: string;
  results: number;
  locations: Location[];
}

export interface GetEventsReturnType {
  status: string;
  results: number;
  events: Event[];
}
