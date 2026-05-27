import api from '../../lib/axios';
import type { BookingDetail, EscrowHold, Quote, QuoteLineItemInput } from '@/types/booking';

type QuoteClientAction = 'accept' | 'reject' | 'counter';

interface QuoteWithEscrowResponse {
  booking: BookingDetail;
  quote: Quote;
  escrow: EscrowHold;
}

interface EscrowStatusResponse {
  booking_id: number;
  escrow: EscrowHold | null;
}

export async function continueJob(bookingId: number, continueJobFlow: boolean): Promise<BookingDetail> {
  const { data } = await api.post(`/api/bookings/${bookingId}/continue-job/`, {
    continue_job: continueJobFlow,
  });
  return data as BookingDetail;
}

export async function createQuote(
  bookingId: number,
  payload: { line_items: QuoteLineItemInput[]; notes?: string }
): Promise<Quote> {
  const { data } = await api.post(`/api/bookings/${bookingId}/quotes/`, payload);
  return data as Quote;
}

export async function getLatestQuote(bookingId: number): Promise<Quote> {
  const { data } = await api.get(`/api/bookings/${bookingId}/quotes/latest/`);
  return data as Quote;
}

export async function submitQuoteClientAction(
  bookingId: number,
  quoteId: number,
  action: QuoteClientAction
): Promise<Quote | QuoteWithEscrowResponse> {
  const { data } = await api.post(`/api/bookings/${bookingId}/quotes/${quoteId}/client-action/`, {
    action,
  });
  return data as Quote | QuoteWithEscrowResponse;
}

export async function getEscrowStatus(bookingId: number): Promise<EscrowStatusResponse> {
  const { data } = await api.get(`/api/bookings/${bookingId}/escrow/`);
  return data as EscrowStatusResponse;
}

// --- NEW PHASE 2 FUNCTIONS ---

export async function completeInitialVisit(bookingId: number): Promise<{ message: string; booking: BookingDetail }> {
  const { data } = await api.post(`/api/bookings/${bookingId}/visit-complete/`);
  return data;
}