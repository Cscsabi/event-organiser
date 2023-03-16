import type { EventType, Location, Contact, Feedback } from "@prisma/client";
import type { Status } from "event-organiser-api-server/src/status.enum";

export interface NewEventStore {
  name: string;
  userEmail: string;
  type?: EventType;
  startDate?: Date;
  endDate?: Date;
  budget: number;
  locationId: string;
  headcount?: number;
  description?: string;
  menuNeeded: boolean;
  decorNeeded: boolean;
  performerNeeded: boolean;
}

export interface LocationStore {
  userEmail: string;
  name: string;
  description?: string;
  addressId: string;
  city: string;
  countryId: number;
  street: string;
  state?: string;
  zipCode?: number;
  type?: string;
  price?: number;
  phone?: string;
  link?: string;
}

export interface GetLocationsReturnType {
  status: Status;
  results: number;
  locations: Location[];
}

export interface Event {
  id: string;
  name: string;
  userEmail: string;
  type: EventType | null;
  startDate: Date | null;
  endDate: Date | null;
  budget: number;
  locationId: string;
  headcount: number | null;
  description: string | null;
  menuNeeded: boolean;
  decorNeeded: boolean;
  performerNeeded: boolean;
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
  date?: Date;
}

export interface GuestListProps {
  userEmail: string;
  openedFromEvent: boolean;
  eventId?: string;
  historic?: boolean;
}

export interface GuestType {
  id: string;
  userEmail: string;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  description: string | null;
}

export interface GuestListStore {
  tableRows: GuestType[];
  connectableGuests: GuestType[];
  selectedGuests: GuestType[];
  unselectedGuests: GuestType[];
  useClientEffectHook: number;
  empty: boolean | undefined;
  lastpage: number;
  currentCursor: string | undefined;
  oldCursor: string | undefined;
  nextButtonClicked: boolean | undefined;
  endOfList: boolean;
}

export interface GetGuestReturnType {
  status: Status;
  guests: GuestType[];
}

export interface EventStore {
  event: NewEventStore;
  location: LocationStore;
  modalOpen: boolean;
  userEmail: string;
  origin: string;
}

export interface FeedbackStore {
  event: NewEventStore;
  location: LocationStore;
  guest: {
    firstname: string;
    lastname: string;
    email: string;
    plusOne: boolean;
    diabetes: boolean;
    lactose: boolean;
    gluten: boolean;
    additional: string;
  };
  eventExists?: boolean;
}

export interface ListProps {
  isActive?: boolean;
  isEvent: boolean;
}

export interface ProfilStore {
  email: string;
  firstname: string;
  lastname: string;
  date: Date;
  newPassword1: string;
  newPassword2: string;
  events: CalendarEvent[];
}

export interface RegisterStore {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  message: string;
  openToast: boolean;
  alreadyRegistered: boolean;
}

export interface LoginStore {
  email: string;
  password: string;
  invalidCredentials: boolean;
}

export interface CardProps {
  id: string;
  name: string;
  description: string;
  location?: string;
  type: string;
  goTo: string;
  icon: string;
}

export interface BudgetPlanningProps {
  eventId: string;
  budget: number;
  active: boolean;
}

export interface BudgetPlanningType {
  id: number;
  amount?: number;
  isPaid: boolean;
  eventId: string;
  description?: string;
  contactId: string;
}

export interface BudgetPlanningStore {
  budgetPlanning: (BudgetPlanningType & {
    contact: Contact;
  })[];
  amountAltogether: number;
  percentAltogether: number;
  userEmail: string;
  modalOpen: boolean;
  modalContactId: string;
  contactId?: string;
  contact?: Contact;
}

export interface ContactProps {
  userEmail: string;
}

export interface ContactType {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  description?: string;
}

export interface ContactStore {
  contacts: ContactType[];
  userEmail: string;
  empty: boolean | undefined;
  lastpage: number;
  currentCursor: string | undefined;
  oldCursor: string | undefined;
  nextButtonClicked: boolean | undefined;
  endOfList: boolean;
}

export interface ContactCard {
  status: Status;
  contact?: Contact;
}

export interface NewContact {
  name: string;
  phone?: string;
  email?: string;
  description?: string;
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

export interface GetFeedbackReturnType {
  status: Status;
  feedbacks: Feedback[];
}

export interface SendEmailInput {
  text: string;
  subject: string;
  html: string;
  recieverEmail: string;
  recieverName?: string;
}

export interface UserAttributes {
  sendEmailInput: SendEmailInput;
  password: string;
}
