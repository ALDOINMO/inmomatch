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

export function GeoRefLocalitySelect({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
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

  useEffect(() => {
    async function load() {
      try {
        const response =
          await fetch(
            "/api/georef/provincias"
          );

        const data =
          await response.json();
          console.log(
  "PROVINCIAS",
  data
);

        setProvinces(
          data.provincias ?? []
        );
      } catch (error) {
        console.error(
          "GeoRef provincias",
          error
        );
      }
    }

    load();
  }, []);

  useEffect(() => {
    async function load() {
      if (!province) {
        setDepartments([]);
        return;
      }

      try {
        const response =
  await fetch(
    `/api/georef/departamentos?provincia=${encodeURIComponent(
      province
    )}`
  );

        const data =
          await response.json();
          console.log(
  "DEPARTAMENTOS",
  data
);

        setDepartments(
          data.departamentos ??
            []
        );
      } catch (error) {
        console.error(
          "GeoRef departamentos",
          error
        );
      }
    }

    load();
  }, [province]);

  useEffect(() => {
    async function load() {
      if (
        !province ||
        !department
      ) {
        setLocalities([]);
        return;
      }

      try {
        const response =
  await fetch(
    `/api/georef/localidades?provincia=${encodeURIComponent(
      province
    )}&departamento=${encodeURIComponent(
      department
    )}`
  );

        const data =
          await response.json();
          console.log(
  "LOCALIDADES",
  data
);

        setLocalities(
          data.localidades ??
            []
        );
      } catch (error) {
        console.error(
          "GeoRef localidades",
          error
        );
      }
    }

    load();
  }, [
    province,
    department,
  ]);

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
            setLocalities([]);
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
          disabled={!province}
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

      <select
        className="h-10 rounded-md border border-border bg-black/20 px-3 text-sm"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        disabled={!department}
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
    </div>
  );
}