"use client";

import { useEffect, useState } from "react";

type Neighborhood = {
  id: string;
  city: string;
  name: string;
};

export function ClientNeighborhoodsSelector({
  cities,
  value,
  onChange,
}: {
  cities: string[];
  value: string[];
  onChange: (
    value: string[]
  ) => void;
}) {
  const [
    neighborhoods,
    setNeighborhoods,
  ] = useState<
  
    Record<
      string,
      Neighborhood[]
    >
  >({});
  const [
  modes,
  setModes,
] = useState<
  Record<string, "INDIFERENTE" | "BARRIOS">
>({});

  useEffect(() => {
    async function load() {
      const result: Record<
        string,
        Neighborhood[]
      > = {};

      for (const location of cities) {
  const city =
    location.split("|").at(-1) ?? "";

  const response =
    await fetch(
      `/api/neighborhoods?city=${encodeURIComponent(
        city
      )}`
    );

        const data =
          await response.json();

        result[location] =
          data.neighborhoods ??
          [];
      }

      setNeighborhoods(
        result
      );
    }

    load();
  }, [cities]);

  function toggle(
    city: string,
    neighborhood: string
  ) {
    const key = `${city}|${neighborhood}`;

    if (
      value.includes(key)
    ) {
      onChange(
        value.filter(
          (v) => v !== key
        )
      );
    } else {
      onChange([
        ...value,
        key,
      ]);
    }
  }

  if (!cities.length)
    return null;

  return (
    <div className="space-y-4">
      {cities.map((city) => (
        <div
          key={city}
          className="rounded-lg border border-border p-4"
        >
          <h4 className="mb-3 font-medium">
  {city.split("|").at(-1)}
</h4>
          <div className="mb-3">
  <label className="flex items-center gap-2 text-sm">
    <input
  type="radio"
  name={`mode-${city}`}
  checked={
    (modes[city] ??
      "INDIFERENTE") ===
    "INDIFERENTE"
  }
  onChange={() => {
    setModes({
      ...modes,
      [city]:
        "INDIFERENTE",
    });

    onChange(
      value.filter(
        (v) =>
          !v.startsWith(
            `${city}|`
          )
      )
    );
  }}
/>


    Indiferente
  </label>

  <label className="mt-2 flex items-center gap-2 text-sm">
    <input
  type="radio"
  name={`mode-${city}`}
  checked={
    modes[city] ===
    "BARRIOS"
  }
  onChange={() =>
    setModes({
      ...modes,
      [city]: "BARRIOS",
    })
  }
/>

    Seleccionar barrios
  </label>
</div>

          {modes[city] ===
  "BARRIOS" && (
  <div className="grid gap-2 md:grid-cols-2">
            {(
              neighborhoods[
                city
              ] ?? []
            ).map(
              (
                neighborhood
              ) => {
                const key = `${city}|${neighborhood.name}`;

                return (
                  <label
                    key={
                      neighborhood.id
                    }
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={value.includes(
                        key
                      )}
                      onChange={() =>
                        toggle(
                          city,
                          neighborhood.name
                        )
                      }
                    />

                    {
                      neighborhood.name
                    }
                  </label>
                );
              }
                        )}
          </div>
        )}
      </div>
    ))}
  </div>
);
}