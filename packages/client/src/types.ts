import type { EventType, Location, Event } from "@prisma/client";

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

export interface CalendarEvent {
  name: string;
  date: Date;
}

export interface GuestListProps {
  userEmail: string;
  openedFromEvent: boolean;
  eventId?: string;
}

export interface GuestType {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  special_needs: string;
}

export interface GuestListStore {
  modalOpen: boolean;
  tableRows: GuestType[];
  connectableGuests: GuestType[];
  selectedGuests: GuestType[];
  useClientEffectHook: number;
}
