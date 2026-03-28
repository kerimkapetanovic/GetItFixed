from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class ProfileEndpointsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="profileuser",
            email="profile@example.com",
            password="OldPass123!",
            first_name="Old",
            last_name="Name",
            role="client",
        )

    def test_get_me_requires_authentication(self):
        response = self.client.get("/api/accounts/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_me_returns_user_data(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/accounts/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "Old")
        self.assertEqual(response.data["email"], "profile@example.com")

    def test_patch_me_updates_name_but_not_email(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            "/api/accounts/me/",
            {
                "first_name": "New",
                "last_name": "Person",
                "email": "should-not-change@example.com",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "New")
        self.assertEqual(self.user.last_name, "Person")
        self.assertEqual(self.user.email, "profile@example.com")

    def test_change_password_requires_authentication(self):
        response = self.client.post(
            "/api/accounts/change-password/",
            {
                "current_password": "OldPass123!",
                "new_password": "NewPass123!",
                "confirm_password": "NewPass123!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_change_password_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/accounts/change-password/",
            {
                "current_password": "OldPass123!",
                "new_password": "NewPass123!",
                "confirm_password": "NewPass123!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewPass123!"))

    def test_change_password_rejects_wrong_current_password(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/accounts/change-password/",
            {
                "current_password": "WrongPass123!",
                "new_password": "NewPass123!",
                "confirm_password": "NewPass123!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
