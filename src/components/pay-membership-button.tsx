"use client";

import { Button } from "@/components/ui/button";

export function PayMembershipButton() {
  async function handlePay() {
    const response =
      await fetch(
        "/api/mercadopago/preference",
        {
          method: "POST",
        }
      );

    const data =
      await response.json();

    if (data.init_point) {
      window.location.href =
        data.init_point;
    }
  }

  return (
    <Button onClick={handlePay}>
      Renovar membresía
    </Button>
  );
}