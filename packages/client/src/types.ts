import type { EventType, Location, Event } from "@prisma/client";
import type { Status } from "event-organiser-api-server/src/status.enum";

export interface EventInterface {
  name: string;
  email: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
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
  status: Status;
  results: number;
  locations: Location[];
}

export interface GetEventsReturnType {
  status: Status;
  results: number;
  events: (Event & {
    location: {
      name: string;
    };
  })[];
}

export interface CalendarEvent {
  name: string;
  date: Date;
}

export interface GuestListProps {
  userEmail: string;
  openedFromEvent: boolean;
  eventId?: string;
  historic?: boolean;
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

export interface GetGuestReturnType {
  status: Status;
  guests: GuestType[];
}

export interface EventStore {
  event?: EventInterface;
  location?: LocationInterface;
  modalOpen: boolean;
  userEmail: string;
}

export interface ListProps {
  isActive?: boolean;
  isEvent: boolean;
}
