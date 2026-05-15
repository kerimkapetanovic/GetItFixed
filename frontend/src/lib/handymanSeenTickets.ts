const storageKey = (username: string) => `getItFixed_handyman_seen_${username}`;

export function getSeenTicketIds(username: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(username));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "number") : [];
  } catch {
    return [];
  }
}

export function markTicketSeen(username: string, ticketId: number): void {
  if (typeof window === "undefined") return;
  const seen = getSeenTicketIds(username);
  if (seen.includes(ticketId)) return;
  localStorage.setItem(storageKey(username), JSON.stringify([...seen, ticketId]));
}
