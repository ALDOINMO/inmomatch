import { redirect } from "next/navigation";

import { User } from "@prisma/client";

export function ensureActiveMembership(
  user: User & {
    realEstate?: {
      membershipExpiresAt: Date | null;
      status: string;
    } | null;
  }
) {
  const expired =
    user.realEstate
      ?.membershipExpiresAt &&
    new Date(
      user.realEstate
        .membershipExpiresAt
    ) < new Date();

  if (
    expired ||
    user.realEstate?.status ===
      "SUSPENDED"
  ) {
    redirect("/membership-expired");
  }
}