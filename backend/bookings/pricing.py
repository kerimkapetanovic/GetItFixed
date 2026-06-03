from decimal import Decimal, ROUND_HALF_UP

APP_FEE_PERCENT = Decimal("0.20")
PDV_PERCENT = Decimal("0.17")


def quantize_money(value: Decimal) -> Decimal:
    return Decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def compute_pricing_breakdown(base_amount: Decimal) -> dict[str, Decimal]:
    base = quantize_money(base_amount)
    if base <= Decimal("0.00"):
        raise ValueError("Base amount must be greater than zero.")

    app_fee = quantize_money(base * APP_FEE_PERCENT)
    pdv_base = quantize_money(base + app_fee)
    pdv = quantize_money(pdv_base * PDV_PERCENT)
    client_total = quantize_money(base + app_fee + pdv)

    return {
        "base_amount": base,
        "app_fee_amount": app_fee,
        "pdv_amount": pdv,
        "client_total_amount": client_total,
    }
