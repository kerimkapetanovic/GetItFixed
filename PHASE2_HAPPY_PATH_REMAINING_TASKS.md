# Phase 2 Happy Path Remaining Tasks

These tasks are the missing pieces needed to make the full Phase 2 flow work end-to-end through UI only (no manual status edits in admin, no Postman calls).

## Goal
- Client and handyman should complete the whole flow from booking to closure only from frontend screens.
- No manual DB/admin overrides should be required to enter `visit_fee_paid`.
- No manual API request should be required to release escrow payment from `funds_locked`.

## Remaining Critical Tasks

### R1) Wire natural transition into Phase 2 branch
- Add backend + frontend transition so a real booking can reach `visit_fee_paid` through normal user actions.
- Ensure this transition is role-safe and follows valid booking state progression.
- Update list/detail UI so phase transition is visible and understandable to users.

## Acceptance
- Starting from normal accepted/in-progress flow, users can reach `visit_fee_paid` without admin edits.

### R2) Add client UI action for escrow release from `funds_locked`
- Add explicit client CTA/button when booking is `funds_locked` (e.g. `Pay / Release Escrow`).
- Wire the button to existing backend endpoint: `POST /api/bookings/{id}/complete/` with `{ "action": "pay" }`.
- Show clear loading, success, and backend error feedback in the booking detail UI.

## Acceptance
- Client can complete payment from UI in `funds_locked` state.
- Booking moves to `paid`, handyman can acknowledge, then `closed`.

### R3) Frontend state/label consistency for new statuses
- Ensure all relevant pages/components render new statuses consistently:
  - `visit_completed`
  - `visit_fee_pending`
  - `visit_fee_paid`
  - `quote_pending_client`
  - `funds_locked`
- Remove contradictory legacy messaging/timers during Phase 2 states.

## Acceptance
- Dashboard cards, request list, and detail pages show correct labels/actions for every Phase 2 status.

### R4) End-to-end automated happy-path test
- Add at least one integration/E2E test that covers:
  - client continue decision
  - handyman quote submission
  - client accept + lock funds
  - client release escrow payment
  - handyman acknowledge -> closed

## Acceptance
- Test passes on clean DB and validates key balances/status transitions.

### R5) Data integrity assertions around escrow release
- Add backend test assertions verifying:
  - lock: `wallet_locked_balance` increases
  - release: `wallet_locked_balance` decreases, `wallet_balance` debits client, credits handyman
  - booking/payment fields update correctly (`payment_amount`, `paid_at`, status progression)

## Acceptance
- Regression tests fail if funds can be double-spent or mis-accounted.

## Suggested Ownership (Tomorrow)
- Assign `R1`, `R2`, `R3` as high priority implementation tasks.
- Assign `R4`, `R5` as hardening + regression tasks before merge.

