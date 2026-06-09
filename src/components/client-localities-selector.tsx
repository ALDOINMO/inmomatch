"use client";

import { useEffect, useState } from "react";

type Province = {
  id: string;
  nombre: string;
};

type Department = {
  id: string;
  nombre: string;
};

type Locality = {
  id: string;
  nombre: string;
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

  const [localities, setLocalities] =
    useState<Locality[]>([]);

  const [province, setProvince] =
    useState("");

  const [department, setDepartment] =
    useState("");

  const [locality, setLocality] =
    useState("");

  useEffect(() => {
    fetch(
      "/api/georef/provincias"
    )
      .then((r) => r.json())
      .then((data) =>
        setProvinces(
          data.provincias ?? []
        )
      );
  }, []);

  useEffect(() => {
    if (!province) {
      setDepartments([]);
      return;
    }

    fetch(
      `/api/georef/departamentos?provincia=${encodeURIComponent(
        province
      )}`
    )
      .then((r) => r.json())
      .then((data) =>
        setDepartments(
          data.departamentos ?? []
        )
      );
  }, [province]);

  useEffect(() => {
    if (
      !province ||
      !department
    ) {
      setLocalities([]);
      return;
    }

    fetch(
      `/api/georef/localidades?provincia=${encodeURIComponent(
        province
      )}&departamento=${encodeURIComponent(
        department
      )}`
    )
      .then((r) => r.json())
      .then((data) =>
        setLocalities(
          data.localidades ?? []
        )
      );
  }, [
    province,
    department,
  ]);

  function addLocality() {
    if (!locality) return;

    if (
      value.includes(
        locality
      )
    )
      return;

    if (value.length >= 4)
      return;

    onChange([
      ...value,
      locality,
    ]);

    setLocality("");
  }

  function removeLocality(
    city: string
  ) {
    onChange(
      value.filter(
        (v) => v !== city
      )
    );
  }


  return (
    <div className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-2">
        <select
          className="h-10 rounded-md border border-border bg-black/20 px-3 text-sm"
          value={province}
          onChange={(e) => {
            setProvince(
              e.target.value
            );
            setDepartment("");
          }}
        >
          <option value="">
            Provincia
          </option>

          {provinces.map((p) => (
            <option
              key={p.id}
              value={p.nombre}
            >
              {p.nombre}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-md border border-border bg-black/20 px-3 text-sm"
          value={department}
          onChange={(e) =>
            setDepartment(
              e.target.value
            )
          }
        >
          <option value="">
            Departamento
          </option>

          {departments.map((d) => (
            <option
              key={d.id}
              value={d.nombre}
            >
              {d.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <select
          className="h-10 flex-1 rounded-md border border-border bg-black/20 px-3 text-sm"
          value={locality}
          onChange={(e) =>
            setLocality(
              e.target.value
            )
          }
        >
          <option value="">
            Localidad
          </option>

          {localities.map((l) => (
            <option
              key={l.id}
              value={l.nombre}
            >
              {l.nombre}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={
            addLocality
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
              removeLocality(
                city
              )
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