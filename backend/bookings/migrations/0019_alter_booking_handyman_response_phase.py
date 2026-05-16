from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("bookings", "0018_booking_handyman_response_phase"),
    ]

    operations = [
        migrations.AlterField(
            model_name="booking",
            name="handyman_response_phase",
            field=models.CharField(
                choices=[
                    ("before_client_time", "Before client proposed time"),
                    ("after_client_time", "After client proposed time"),
                    ("negotiation", "Counter-offer negotiation"),
                ],
                default="before_client_time",
                max_length=30,
            ),
        ),
    ]
