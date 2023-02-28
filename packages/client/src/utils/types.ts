import type { EventType, Location, Event, Contact } from "@prisma/client";
import type { Status } from "event-organiser-api-server/src/status.enum";

export interface NewEventStore {
  name: string;
  email: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
  budget: number;
  locationId: string;
  headcount: number;
  menuNeeded: boolean;
  decorNeeded: boolean;
  performerNeeded: boolean;
}

export interface LocationStore {
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
  unselectedGuests: GuestType[];
  useClientEffectHook: number;
}

export interface GetGuestReturnType {
  status: Status;
  guests: GuestType[];
}

export interface EventStore {
  event?: NewEventStore;
  location?: LocationStore;
  modalOpen: boolean;
  userEmail: string;
}

export interface ListProps {
  isActive?: boolean;
  isEvent: boolean;
}

export interface ProfilStore {
  checkbox: boolean;
  email: string;
  date: Date;
  events: CalendarEvent[];
}

export interface RegisterStore {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  message: string;
}

export interface LoginStore {
  email: string;
  password: string;
}

export interface CardProps {
  id: string;
  name: string;
  description: string;
  location?: string;
  color: string;
  goTo: string;
  icon: string;
}

export interface BudgetPlanningProps {
  eventId: string;
  budget: number;
}

export interface BudgetPlanningType {
  contactName: string;
  amount: number;
  isPaid: boolean;
  eventId: string;
  description: string;
  contactId: string;
}

export interface BudgetPlanningStore {
  budgetPlanning: BudgetPlanningType[];
  amountAltogether: number;
  percentAltogether: number;
  userEmail: string;
  contactId?: string;
  contact?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    description: string;
    userEmail: string;
  };
}

export interface ContactProps {
  userEmail: string;
}

export interface ContactType {
  id: string;
  name: string;
  phone: string;
  email: string;
  description: string;
}

export interface ContactStore {
  contacts: ContactType[];
  modalOpen: boolean;
  modalContactId: string;
  userEmail: string;
}

export interface ContactCard {
  status: Status;
  contact?: Contact;
}

export interface NewContact {
  name: string;
  cost: number;
  phone: string;
  email: string;
  description: string;
  userEmail: string;
}

export interface ContactReturnType {
  status: Status;
  contacts?: Contact;
}

export interface ContactsReturnType {
  status: Status;
  contacts?: Contact[];
}
