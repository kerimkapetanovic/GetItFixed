// @/types/booking.ts

export type BookingStatus = | 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'declined';
  export type NegotiationStatus = 'none' | 'awaiting_handyman' | 'awaiting_client' | 'agreed' | 'declined';

export interface BookingDetail {
  id: number;
  ticket_id: string; // DODAJ OVO OVDJE
  service_type: string;
  description: string;
  status: BookingStatus;
  negotiation_status: NegotiationStatus;
  client_name: string;
  client_email: string;

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
  duration_minutes: number | null;    // Trajanje u minutama (ako je posao u toku ili završen)

  updated_at: string; // OBAVEZNO: Da znamo kad je bila zadnja akcija
  created_at: string; // Dobro je imati za inicijalni request
}

// Opcionalno: Interface za radno vrijeme majstora ako ga budeš vukao posebno
export interface HandymanAvailability {
  day_of_week: number; // 0-6
  start_time: string;  // "08:00"
  end_time: string;    // "16:00"
}