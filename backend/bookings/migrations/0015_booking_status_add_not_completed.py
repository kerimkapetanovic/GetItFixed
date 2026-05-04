from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("bookings", "0014_booking_client_confirmed_done_at_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="booking",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("accepted", "Accepted"),
                    ("in_progress", "In Progress"),
                    ("handyman_done", "Handyman Done"),
                    ("not_completed", "Not Completed"),
                    ("completed", "Completed"),
                    ("cancelled", "Cancelled"),
                ],
                default="pending",
                max_length=20,
            ),
        ),
    ]
