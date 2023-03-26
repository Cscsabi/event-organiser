import type {
  EventType,
  LocationType,
  Location,
  Contact,
  Feedback,
} from "@prisma/client";
import type { Status } from "event-organiser-api-server/src/status.enum";

export interface NewEventStore {
  name: string;
  type?: EventType;
  startDate?: Date;
  endDate?: Date;
  budget: number;
  locationId: string;
  headcount?: number;
  description?: string;
  chooseHere?: string;
  loading?: string;
}

export interface LocationStore {
  name: string;
  description?: string;
  addressId: string;
  city: string;
  countryId: number;
  street: string;
  state?: string;
  zipCode?: number;
  type: LocationType;
  price?: number;
  phone?: string;
  link?: string;
  chooseHere?: string;
  loading?: string;
}

export interface GetLocationsReturnType {
  status: Status;
  results: number;
  locations: (Location & {
    address: {
      city: string;
    };
  })[];
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
  lastpage: number;
  currentCursor: string | undefined;
  oldCursor: string | undefined;
  nextButtonClicked: boolean | undefined;
  endOfList: boolean;
  searchInput: string;
  searchInput2: string;
}

export interface GetGuestReturnType {
  status: Status;
  guests: GuestType[];
}

export interface FeedbackTranslations {
  firstname: string;
  lastname: string;
  email: string;
  diabetes: string;
  gluten: string;
  lactose: string;
  plusOne: string;
  additional: string;
  noFeedbacks: string;
}

export interface EventStore {
  event: NewEventStore;
  location: LocationStore;
  modalOpen: boolean;
  origin: string;
  feedbackTranslations: FeedbackTranslations;
  loading?: string;
  attachmentTranslation?: AttachmentTranslation;
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
  notEligible: string;
  thankYou: string;
  alreadyFilledForm: string;
}

export interface ListProps {
  isActive?: boolean;
  isEvent: boolean;
}

export interface ProfilStore {
  firstname: string;
  lastname: string;
  date: Date;
  newPassword1: string;
  newPassword2: string;
  events: CalendarEvent[];
  language?: string;
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
  modalOpen: boolean;
  modalContactId: string;
  contactId?: string;
  contact?: Contact;
  chooseHere?: string;
  loading?: string;
}

export interface ContactType {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  description?: string;
  link?: string;
}

export interface ContactStore {
  contacts: ContactType[];
  lastpage: number;
  currentCursor: string | undefined;
  oldCursor: string | undefined;
  nextButtonClicked: boolean | undefined;
  endOfList: boolean;
  searchInput: string;
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
  link?: string;
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

export interface SendEmailWithAttachmentInput {
  firstname: string;
  lastname: string;
  text: string;
  subject: string;
  html: string;
  recieverEmail: string;
  recieverName?: string;
  filename: string;
  contentType: string;
  base64Content: string;
}

export interface UserAttributes {
  sendEmailInput: SendEmailInput;
  password: string;
}

export interface UserContext {
  userEmail?: string;
  darkModeEnabled?: boolean;
  language?: string;
  privateHeader?: boolean;
  firstname?: string;
  lastname?: string;
}

export interface TypeTranslations {
  wedding: string;
  graduation: string;
  party: string;
  conference: string;
  exhibition: string;
  custom: string;
  interior: string;
  exterior: string;
  both: string;
}

export interface InformationCardProps {
  name: string;
  description: string;
  icon: string;
  goTo: string;
  textCenter?: boolean;
}

export interface GuestTranslations {
  guestlist: string;
  firstname: string;
  lastname: string;
  email: string;
  specialNeeds: string;
}

export interface NewGuest {
  firstname: string;
  lastname: string;
  email: string;
  description: string;
}

export interface AttachmentTranslation {
  attachmentText: string;
  attachmentText2: string;
  bestWishes: string;
}

export interface BudgetPlanningRow {
  id: number;
  amount: number;
  contactName: string;
  isPaid: boolean;
  eventId: string;
  description: string;
  contactId: string;
  contact: {
      id: string;
      name: string;
      phone: string;
      email: string;
      description: string;
      link: string;
      userEmail: string;
  };
}

export interface TipCardProps {
  hint1: string;
  hint2: string;
}