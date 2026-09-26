import { request } from './api';
import { USE_MOCK_DATA } from './config';
import * as mock from './mockApi';
import type { EventItem } from './types';

/** GET /events → all upcoming events, soonest first. */
export function listEvents(): Promise<EventItem[]> {
  return USE_MOCK_DATA ? mock.listEvents() : request<EventItem[]>({ method: 'GET', url: '/events' });
}
