"use client";

import { useEffect, useState } from "react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createNeighborhoodAction } from "@/actions/neighborhoods";

type Neighborhood = {
  id: string;
  city: string;
  name: string;
};

export function NeighborhoodSelect({
  city,
  value,
  onChange,
}: {
  city: string;
  value?: string;
  onChange: (value: string) => void;
}) {
  const [
    neighborhoods,
    setNeighborhoods,
  ] = useState<Neighborhood[]>(
    []
  );

  const [
  showNewNeighborhood,
  setShowNewNeighborhood,
] = useState(false);

const [
  newNeighborhood,
  setNewNeighborhood,
] = useState("");

const [pending, startTransition] =
  useTransition();

  useEffect(() => {
    async function load() {
      if (!city) {
        setNeighborhoods([]);
        return;
      }

      const response =
        await fetch(
          `/api/neighborhoods?city=${encodeURIComponent(
            city
          )}`
        );

      const data =
        await response.json();

      setNeighborhoods(
        data.neighborhoods ??
          []
      );
    }

    load();
  }, [city]);

  return (
  <div className="space-y-2">
    <select
      className="h-10 rounded-md border border-border bg-black/20 px-3 text-sm"
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
      disabled={!city}
    >
      <option value="">
        Seleccionar barrio
      </option>

      {neighborhoods.map(
        (neighborhood) => (
          <option
            key={neighborhood.id}
            value={
              neighborhood.name
            }
          >
            {neighborhood.name}
          </option>
        )
      )}
    </select>

    <Button
      type="button"
      variant="ghost"
      onClick={() =>
        setShowNewNeighborhood(
          !showNewNeighborhood
        )
      }
    >
      + Agregar barrio
    </Button>

    {showNewNeighborhood && (
      <div className="flex gap-2">
        <input
          className="h-10 flex-1 rounded-md border border-border bg-black/20 px-3 text-sm"
          value={newNeighborhood}
          onChange={(e) =>
            setNewNeighborhood(
              e.target.value
            )
          }
          placeholder="Nombre del barrio"
        />

        <Button
          type="button"
          disabled={
            pending ||
            !newNeighborhood.trim()
          }
          onClick={() =>
            startTransition(
              async () => {
                const result =
                  await createNeighborhoodAction(
                    city,
                    newNeighborhood.trim()
                  );

                if (
                  "error" in result
                ) {
                  alert(
                    result.error
                  );
                  return;
                }

                const response =
                  await fetch(
                    `/api/neighborhoods?city=${encodeURIComponent(
                      city
                    )}`
                  );

                const data =
                  await response.json();

                setNeighborhoods(
                  data.neighborhoods ??
                    []
                );

                onChange(
                  result.name
                );

                setNewNeighborhood(
                  ""
                );

                setShowNewNeighborhood(
                  false
                );
              }
            )
          }
        >
          Guardar
        </Button>
      </div>
    )}
  </div>
);
}