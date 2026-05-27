from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0011_user_wallet_locked_balance"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="terms_accepted",
            field=models.BooleanField(default=False),
        ),
    ]
