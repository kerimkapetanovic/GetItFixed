from django.db import migrations, models


def set_initial_verification_status(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    # Existing handymen that are not active were historically "pending" in this app.
    User.objects.filter(role="handyman", is_active=False).update(verification_status="pending")
    User.objects.filter(role="handyman", is_active=True).update(verification_status="active")
    User.objects.exclude(role="handyman").update(verification_status="active")


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0012_user_terms_accepted"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="verification_status",
            field=models.CharField(
                choices=[("pending", "Pending"), ("active", "Active"), ("inactive", "Inactive")],
                default="active",
                max_length=10,
            ),
        ),
        migrations.RunPython(set_initial_verification_status, migrations.RunPython.noop),
    ]

