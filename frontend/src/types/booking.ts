// @/types/booking.ts

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'visit_completed'
  | 'visit_fee_pending'
  | 'visit_fee_paid'
  | 'quote_pending_client'
  | 'funds_locked'
  | 'completed'
  | 'cancelled'
  | 'declined'
  | 'handyman_done'
  | 'not_completed'
  | 'awaiting_payment'
  | 'paid'
  | 'closed';
export type NegotiationStatus = 'none' | 'awaiting_handyman' | 'awaiting_client' | 'agreed' | 'declined';
export type HandymanResponsePhase = 'before_client_time' | 'after_client_time' | 'negotiation';
export type QuoteStatus =
  | 'none'
  | 'draft'
  | 'pending_client'
  | 'accepted'
  | 'rejected'
  | 'countered'
  | 'expired'
  | 'cancelled';
export type EscrowStatus = 'locked' | 'released' | 'refunded' | 'cancelled';
export type QuoteLineItemCategory = 'materials' | 'labor' | 'other';

export interface BookingDetail {
  id: number;
  ticket_id: string; // DODAJ OVO OVDJE
  service_type: string;
  description: string;
  status: BookingStatus;
  negotiation_status: NegotiationStatus;
  client_name: string;
  client_email: string;
  client_phone: string;

  // --- VREMENSKI TERMINI ---
  scheduled_time: string | null;           // Finalni dogovoreni termin
  client_proposed_time: string | null;     // Prvi termin koji klijent klikne u kalendaru
  handyman_proposed_time: string | null;   // Ako majstor lupi Counter-offer za vrijeme
  is_urgent: boolean;                      // Da li je hitno (ako klijent označi kao hitno prilikom kreiranja requesta)
  last_action_by: 'client' | 'handyman';             // Tko je zadnji napravio akciju (client ili handyman)

  // --- PORUKE ---
  client_counter_message: string | null;
  handyman_counter_message: string | null;

  // --- INFO O MAJSTORU ---
  handyman_id: number | null;
  handyman_name: string | null;
  handyman_email: string | null;
  handyman_phone: string | null;

  // --- NOVO: LOGIKA "BEZ MANA" ---
  diagnostic_fee: string | null;      // Cijena dolaska (šalje se kao string/decimal sa beka)
  estimated_duration: number | null;  // Procjena u minutama (npr. 60, 90, 120)
  expires_at: string | null;          // ISO string za Countdown tajmer
  handyman_response_phase?: HandymanResponsePhase;
  duration_minutes: number | null;    // Trajanje u minutama (ako je posao u toku ili završen)
  knows_fix: boolean | null;         // Da li majstor zna u čemu je problem (ako je true, onda se ne prikazuje Countdown i "I don't know" opcija)
  visit_fee_amount?: number | null;
  visit_fee_paid_at?: string | null;
  continue_job_requested?: boolean;
  continue_job_confirmed?: boolean | null;
  job_continued_at?: string | null;
  quote_status?: QuoteStatus;
  quote_locked_amount?: number | null;
  funds_locked_at?: string | null;
  latest_quote?: Quote | null;
  latest_escrow_hold?: EscrowHold | null;

  estimated_price?: number;
  agreed_price?: number | null;
  payment_amount?: number | null;
  paid_at?: string | null;

  updated_at: string; // OBAVEZNO: Da znamo kad je bila zadnja akcija
  created_at: string; // Dobro je imati za inicijalni request
}

// Opcionalno: Interface za radno vrijeme majstora ako ga budeš vukao posebno
export interface HandymanAvailability {
  day_of_week: number; // 0-6
  start_time: string;  // "08:00"
  end_time: string;    // "16:00"
}

export interface QuoteLineItemInput {
  category: QuoteLineItemCategory;
  description: string;
  quantity: number;
  unit_price: number;
  sort_order?: number;
}

export interface QuoteLineItem extends QuoteLineItemInput {
  id: number;
  line_total: number;
}

export interface Quote {
  id: number;
  booking: number;
  handyman: number;
  version: number;
  status: QuoteStatus;
  subtotal_materials: number;
  subtotal_labor: number;
  subtotal_other: number;
  total_amount: number;
  notes: string | null;
  submitted_at: string | null;
  client_decision_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  line_items: QuoteLineItem[];
}

export interface EscrowHold {
  id: number;
  booking: number;
  quote: number | null;
  client: number;
  handyman: number;
  amount: number;
  status: EscrowStatus;
  reason: string | null;
  locked_at: string;
  released_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}