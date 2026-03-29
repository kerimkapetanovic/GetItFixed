// @/types/booking.ts

export type BookingStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';
export type NegotiationStatus = 'none' | 'awaiting_handyman' | 'awaiting_client' | 'agreed' | 'declined';

export interface BookingDetail {
  id: number;
  service_type: string;
  description: string;
  status: BookingStatus;
  negotiation_status: NegotiationStatus;

  // --- VREMENSKI TERMINI ---
  scheduled_time: string | null;           // Finalni dogovoreni termin
  client_proposed_time: string | null;     // Prvi termin koji klijent klikne u kalendaru
  handyman_proposed_time: string | null;   // Ako majstor lupi Counter-offer za vrijeme

  // --- PORUKE ---
  client_counter_message: string | null;
  handyman_counter_message: string | null;

  // --- INFO O MAJSTORU ---
  handyman_name: string | null;
  handyman_email: string | null;

  // --- NOVO: LOGIKA "BEZ MANA" ---
  diagnostic_fee: string | null;      // Cijena dolaska (šalje se kao string/decimal sa beka)
  estimated_duration: number | null;  // Procjena u minutama (npr. 60, 90, 120)
  expires_at: string | null;          // ISO string za Countdown tajmer
}

// Opcionalno: Interface za radno vrijeme majstora ako ga budeš vukao posebno
export interface HandymanAvailability {
  day_of_week: number; // 0-6
  start_time: string;  // "08:00"
  end_time: string;    // "16:00"
}