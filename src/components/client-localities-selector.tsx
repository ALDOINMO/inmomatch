"use client";

import { useEffect, useState } from "react";

type Province = {
  province: string;
};

type Department = {
  department: string;
};

type City = {
  city: string;
};

export function ClientLocalitiesSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (
    value: string[]
  ) => void;
}) {
  const [provinces, setProvinces] =
    useState<Province[]>([]);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [cities, setCities] =
    useState<City[]>([]);

  const [province, setProvince] =
    useState("");

  const [department, setDepartment] =
    useState("");

  const [city, setCity] =
    useState("");

  useEffect(() => {
    async function load() {
      const response =
        await fetch(
          "/api/locations/provinces"
        );

      const data =
        await response.json();

      setProvinces(
        data.provinces ?? []
      );
    }

    load();
  }, []);

  useEffect(() => {
    async function load() {
      if (!province) {
        setDepartments([]);
        return;
      }

      const response =
        await fetch(
          `/api/locations/departments?province=${encodeURIComponent(
            province
          )}`
        );

      const data =
        await response.json();

      setDepartments(
        data.departments ?? []
      );
    }

    load();
  }, [province]);

  useEffect(() => {
    async function load() {
      if (
        !province ||
        !department
      ) {
        setCities([]);
        return;
      }

      const response =
        await fetch(
          `/api/locations/cities?province=${encodeURIComponent(
            province
          )}&department=${encodeURIComponent(
            department
          )}`
        );

      const data =
        await response.json();

      setCities(
        data.cities ?? []
      );
    }

    load();
  }, [
    province,
    department,
  ]);

  function addCity() {
    if (!city) return;

    if (
      value.includes(city)
    )
      return;

    if (value.length >= 4)
      return;

    onChange([
      ...value,
      city,
    ]);

    setCity("");
  }

  function removeCity(
    cityToRemove: string
  ) {
    onChange(
      value.filter(
        (v) =>
          v !== cityToRemove
      )
    );
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-2">
        <select
          className="h-10 w-full rounded-md border border-border bg-black/20 px-3 text-sm"
          value={province}
          onChange={(e) => {
            setProvince(
              e.target.value
            );

            setDepartment(
              ""
            );

            setCities([]);
          }}
        >
          <option value="">
            Provincia
          </option>

          {provinces.map(
            (province) => (
              <option
                key={
                  province.province
                }
                value={
                  province.province
                }
              >
                {
                  province.province
                }
              </option>
            )
          )}
        </select>

        <select
          className="h-10 w-full rounded-md border border-border bg-black/20 px-3 text-sm"
          value={department}
          onChange={(e) =>
            setDepartment(
              e.target.value
            )
          }
          disabled={!province}
        >
          <option value="">
            Departamento
          </option>

          {departments.map(
            (department) => (
              <option
                key={
                  department.department
                }
                value={
                  department.department
                }
              >
                {
                  department.department
                }
              </option>
            )
          )}
        </select>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <select
          className="h-10 min-w-0 rounded-md border border-border bg-black/20 px-3 text-sm"
          value={city}
          onChange={(e) =>
            setCity(
              e.target.value
            )
          }
          disabled={!department}
        >
          <option value="">
            Localidad
          </option>

          {cities.map(
            (city) => (
              <option
                key={city.city}
                value={city.city}
              >
                {city.city}
              </option>
            )
          )}
        </select>

        <button
          type="button"
          onClick={
            addCity
          }
          className="rounded-md border border-border px-4"
        >
          Agregar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {value.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() =>
              removeCity(city)
            }
            className="rounded-full border border-border px-3 py-1 text-sm"
          >
            {city} ✕
          </button>
        ))}
      </div>
    </div>
  );
}