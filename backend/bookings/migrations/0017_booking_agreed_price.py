# Generated manually for agreed job price at negotiation.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("bookings", "0016_booking_payment_flow"),
    ]

    operations = [
        migrations.AddField(
            model_name="booking",
            name="agreed_price",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                help_text="Price (KM) fixed when the handyman accepts or counters.",
                max_digits=10,
                null=True,
            ),
        ),
    ]
