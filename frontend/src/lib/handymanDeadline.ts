import { BookingDetail } from "@/types/booking";

export function isFirstHandymanTurn(booking: BookingDetail | null): boolean {
  return !booking?.handyman_proposed_time;
}

export function isAfterClientTimePhase(booking: BookingDetail | null): boolean {
  return booking?.handyman_response_phase === "after_client_time";
}

export function isNegotiationRound(booking: BookingDetail | null): boolean {
  if (!booking) return false;
  return (
    booking.handyman_response_phase === "negotiation" || !isFirstHandymanTurn(booking)
  );
}

export function canHandymanSendOffer(booking: BookingDetail | null): boolean {
  if (!booking) return false;
  return !isAfterClientTimePhase(booking);
}

export function getResponseDeadlineLabel(booking: BookingDetail | null): string {
  if (!booking) return "Response deadline";
  if (isAfterClientTimePhase(booking)) {
    return "Respond with decline or counter";
  }
  if (isNegotiationRound(booking)) {
    return "Response deadline";
  }
  if (booking.client_proposed_time) {
    const proposed = new Date(booking.client_proposed_time).getTime();
    const expires = booking.expires_at ? new Date(booking.expires_at).getTime() : 0;
    if (proposed > Date.now() && expires <= proposed + 60_000) {
      return "Respond before client's requested time";
    }
  }
  return "Response deadline";
}

export function getPhaseHint(booking: BookingDetail | null): string | null {
  if (!booking) return null;
  if (isAfterClientTimePhase(booking)) {
    return "The client's requested appointment time has passed. You can only decline or send a counter offer with a new time. If you do nothing, this request will be declined automatically.";
  }
  if (isNegotiationRound(booking)) {
    return "You have 3 hours to respond to the client's counter offer.";
  }
  if (booking.client_proposed_time) {
    const proposed = new Date(booking.client_proposed_time);
    if (proposed.getTime() > Date.now()) {
      return "The timer counts down to the client's requested time first. After that, you will have 3 hours to decline or counter.";
    }
  }
  return null;
}
