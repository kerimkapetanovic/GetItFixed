import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "client" | "handyman" | "admin";

export function useRequireRole(allowedRoles: Role[]) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("user_role") as Role | null;
    const isLoggedIn = localStorage.getItem("is_logged_in");

    if (!isLoggedIn || !role) {
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(role)) {
      router.replace("/unauthorized");
      return;
    }

    setChecking(false);
  }, []);

  return { checking };
}