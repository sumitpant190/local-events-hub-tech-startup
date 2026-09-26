// Sample data reused from Frontend/src/services/mockData so both sides line up. Ids, titles, descriptions,
// categories and start times match the frontend. Organizers and comment authors are mapped onto the four
// seeded users, and attendeeCount / commentCount are derived from the RSVPs and comments below.
import type { EventCategory, RsvpStatus, UserRole } from '../src/types.ts';

/** Emulator-only demo password, the same one the frontend's mock backend accepts. */
export const DEMO_PASSWORD = 'startup123';
export const RSVP_UPDATED_AT = '2026-09-25T12:00:00.000Z';

export interface SeedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface SeedComment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface SeedEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: EventCategory;
  organizerId: string;
  rsvps: Record<string, RsvpStatus>;
  comments: SeedComment[];
}

export const seedUsers: SeedUser[] = [
  { id: 'usr-01', name: 'Maya Chen', email: 'maya@loopdesk.io', role: 'organizer' },
  { id: 'usr-04', name: 'Daniel Okafor', email: 'daniel@buildspace.club', role: 'organizer' },
  { id: 'usr-05', name: 'Priya Raman', email: 'priya@student.uni.edu', role: 'attendee' },
  { id: 'usr-06', name: 'Liam Novak', email: 'liam@stackpilot.app', role: 'attendee' },
];

export const seedEvents: SeedEvent[] = [
  {
    id: 'evt-01',
    title: 'Build Weekend: 48h AI Hackathon',
    description:
      'Form a team on Friday night, ship an AI-powered prototype by Sunday afternoon. Mentors from local startups on hand all weekend, plus GPU credits for every team. Demos judged on usefulness, not polish.',
    date: '2026-10-09T17:00:00.000Z',
    location: 'The Foundry Co-working, 12 Market Street, 3rd Floor',
    category: 'Hackathon',
    organizerId: 'usr-04',
    rsvps: { 'usr-05': 'going', 'usr-06': 'going', 'usr-01': 'not_going' },
    comments: [
      { id: 'cmt-01', userId: 'usr-05', text: 'Looking for a teammate who knows React Native!', createdAt: '2026-09-20T10:12:00.000Z' },
      { id: 'cmt-03', userId: 'usr-06', text: 'Is there a theme or can we build anything AI-related?', createdAt: '2026-09-22T15:05:00.000Z' },
    ],
  },
  {
    id: 'evt-02',
    title: 'Founders & Coffee',
    description:
      'A relaxed Saturday-morning meetup for early-stage founders. No slides, no pitches — just honest conversations about hiring, fundraising and burnout over good coffee.',
    date: '2026-10-03T08:30:00.000Z',
    location: 'Grindhouse Café, 48 Riverside Walk',
    category: 'Networking',
    organizerId: 'usr-01',
    rsvps: { 'usr-04': 'going', 'usr-06': 'going' },
    comments: [
      { id: 'cmt-04', userId: 'usr-04', text: 'Best Saturday routine. See you all there.', createdAt: '2026-09-18T09:00:00.000Z' },
      { id: 'cmt-05', userId: 'usr-01', text: 'I will be around if anyone wants to chat pre-seed.', createdAt: '2026-09-19T11:30:00.000Z' },
    ],
  },
  {
    id: 'evt-03',
    title: 'Pitch Night: Seed Stage Edition',
    description:
      'Eight pre-seed and seed startups get five minutes each in front of a panel of angels and VCs. Live Q&A after every pitch, and audience vote for the crowd favourite.',
    date: '2026-10-15T18:00:00.000Z',
    location: 'Innovation Hall, 1 University Avenue, Block C',
    category: 'Pitch Night',
    organizerId: 'usr-01',
    rsvps: { 'usr-05': 'going', 'usr-04': 'going', 'usr-06': 'not_going' },
    comments: [
      { id: 'cmt-07', userId: 'usr-05', text: 'Can students attend as audience?', createdAt: '2026-09-16T12:45:00.000Z' },
      { id: 'cmt-08', userId: 'usr-01', text: 'Yes! Audience tickets are open to everyone.', createdAt: '2026-09-16T14:02:00.000Z' },
    ],
  },
  {
    id: 'evt-04',
    title: 'Hands-on: Fine-tuning Small LLMs',
    description:
      'A practical workshop on fine-tuning open-weight language models on a laptop budget. Bring your own machine; we cover dataset prep, LoRA, evaluation and deployment.',
    date: '2026-10-20T14:00:00.000Z',
    location: 'NeuralForge Lab, 77 Quantum Lane',
    category: 'Workshop',
    organizerId: 'usr-04',
    rsvps: { 'usr-06': 'going', 'usr-05': 'going' },
    comments: [
      { id: 'cmt-09', userId: 'usr-06', text: 'Will 16GB RAM be enough for the exercises?', createdAt: '2026-09-23T17:10:00.000Z' },
      { id: 'cmt-10', userId: 'usr-04', text: 'Yes, we use small models and quantisation. You will be fine.', createdAt: '2026-09-23T18:00:00.000Z' },
    ],
  },
  {
    id: 'evt-05',
    title: 'Accelerator Demo Day — Cohort 7',
    description:
      'Twelve startups graduate from the Launchpad accelerator and show what they built in 12 weeks. Investor-only session in the morning, open doors from 2pm.',
    date: '2026-11-05T13:00:00.000Z',
    location: 'Launchpad HQ, 200 Harbour Road',
    category: 'Demo Day',
    organizerId: 'usr-01',
    rsvps: { 'usr-04': 'going', 'usr-05': 'going', 'usr-06': 'going' },
    comments: [
      { id: 'cmt-11', userId: 'usr-04', text: 'Cohort 6 demo day was packed. Come early for seats.', createdAt: '2026-09-24T09:30:00.000Z' },
      { id: 'cmt-12', userId: 'usr-01', text: 'Excited to see the fintech teams this year.', createdAt: '2026-09-24T13:15:00.000Z' },
    ],
  },
  {
    id: 'evt-06',
    title: 'Panel: Bootstrapping vs. Raising',
    description:
      'Three founders who went different routes — bootstrapped, angel-funded and VC-backed — debate what they would do differently. Moderated audience Q&A to close.',
    date: '2026-10-22T17:30:00.000Z',
    location: 'City Library Auditorium, 5 Civic Square',
    category: 'Panel',
    organizerId: 'usr-01',
    rsvps: { 'usr-06': 'going', 'usr-05': 'not_going' },
    comments: [
      { id: 'cmt-13', userId: 'usr-06', text: 'Bootstrapped for three years. Keen to hear the other side.', createdAt: '2026-09-17T20:05:00.000Z' },
      { id: 'cmt-14', userId: 'usr-01', text: 'Bring your hardest questions for the VC-backed founder.', createdAt: '2026-09-18T08:25:00.000Z' },
    ],
  },
  {
    id: 'evt-07',
    title: 'Tech Mixer: Devs × Designers',
    description:
      'An evening mixer to help developers and designers find co-founders and collaborators. Colour-coded name badges, lightning intros and snacks.',
    date: '2026-10-29T18:30:00.000Z',
    location: 'The Foundry Co-working, 12 Market Street, Rooftop',
    category: 'Networking',
    organizerId: 'usr-04',
    rsvps: { 'usr-05': 'going', 'usr-01': 'going' },
    comments: [
      { id: 'cmt-15', userId: 'usr-05', text: 'Designer here looking for a technical co-founder.', createdAt: '2026-09-22T21:40:00.000Z' },
      { id: 'cmt-16', userId: 'usr-04', text: 'Rooftop if the weather holds, indoors otherwise.', createdAt: '2026-09-23T10:00:00.000Z' },
    ],
  },
  {
    id: 'evt-08',
    title: 'Intro to Computer Vision with Python',
    description:
      'Beginner-friendly workshop covering image classification and object detection with open-source tools. Ideal for students and developers new to ML.',
    date: '2026-11-12T10:00:00.000Z',
    location: 'Engineering Building, Lab 204, 1 University Avenue',
    category: 'Workshop',
    organizerId: 'usr-04',
    rsvps: { 'usr-05': 'going' },
    comments: [
      { id: 'cmt-17', userId: 'usr-05', text: 'Perfect timing for my final-year project.', createdAt: '2026-09-25T16:30:00.000Z' },
      { id: 'cmt-18', userId: 'usr-04', text: 'Waitlist is open. We will add seats if the lab allows.', createdAt: '2026-09-25T18:10:00.000Z' },
    ],
  },
  {
    id: 'evt-09',
    title: 'Climate Tech Hack Day',
    description:
      'A one-day sprint on energy, mobility and circular-economy challenges set by local climate startups. Winning team gets a pilot with a partner company.',
    date: '2026-11-21T08:00:00.000Z',
    location: 'Greenworks Studio, 31 Canal Street',
    category: 'Hackathon',
    organizerId: 'usr-04',
    rsvps: { 'usr-06': 'going', 'usr-05': 'not_going' },
    comments: [
      { id: 'cmt-19', userId: 'usr-06', text: 'Any datasets we can look at before the day?', createdAt: '2026-09-21T11:00:00.000Z' },
      { id: 'cmt-20', userId: 'usr-04', text: 'Challenge briefs go out one week before.', createdAt: '2026-09-21T12:20:00.000Z' },
    ],
  },
  {
    id: 'evt-10',
    title: 'Student Startup Pitch Night',
    description:
      'University teams pitch their side projects and startups to alumni founders. Five-minute pitches, practical feedback and a small grant for the winner.',
    date: '2026-11-18T17:00:00.000Z',
    location: 'Student Union, Main Hall, 3 Campus Green',
    category: 'Pitch Night',
    organizerId: 'usr-01',
    rsvps: { 'usr-05': 'going', 'usr-06': 'going', 'usr-04': 'not_going' },
    comments: [
      { id: 'cmt-21', userId: 'usr-01', text: 'Alumni judges this year include two YC founders.', createdAt: '2026-09-19T15:45:00.000Z' },
      { id: 'cmt-22', userId: 'usr-05', text: 'Our team is pitching. Wish us luck!', createdAt: '2026-09-20T09:10:00.000Z' },
    ],
  },
  {
    id: 'evt-11',
    title: 'Panel: Women Building in Deep Tech',
    description:
      'Founders and engineers from robotics, biotech and AI infrastructure share how they got started and what the ecosystem still gets wrong.',
    date: '2026-12-02T17:30:00.000Z',
    location: 'Innovation Hall, 1 University Avenue, Block A',
    category: 'Panel',
    organizerId: 'usr-01',
    rsvps: { 'usr-05': 'going', 'usr-06': 'not_going' },
    comments: [
      { id: 'cmt-23', userId: 'usr-04', text: 'One of the most important panels of the year.', createdAt: '2026-09-24T10:30:00.000Z' },
      { id: 'cmt-24', userId: 'usr-06', text: 'Will there be a recording for those who cannot attend?', createdAt: '2026-09-24T14:50:00.000Z' },
    ],
  },
  {
    id: 'evt-12',
    title: 'SaaS Demo Day & Year-end Mixer',
    description:
      'Local SaaS startups demo new launches in short 3-minute slots, followed by a year-end mixer with founders, investors and operators.',
    date: '2026-12-10T16:00:00.000Z',
    location: 'Launchpad HQ, 200 Harbour Road',
    category: 'Demo Day',
    organizerId: 'usr-01',
    rsvps: { 'usr-06': 'going', 'usr-04': 'going', 'usr-05': 'going' },
    comments: [
      { id: 'cmt-25', userId: 'usr-06', text: 'Launching our v2 here. Come say hi!', createdAt: '2026-09-25T20:00:00.000Z' },
      { id: 'cmt-26', userId: 'usr-04', text: 'Great way to close out the year.', createdAt: '2026-09-26T08:15:00.000Z' },
    ],
  },
];
