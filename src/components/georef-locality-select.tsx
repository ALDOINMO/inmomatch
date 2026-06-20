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

export function GeoRefLocalitySelect({
  value,
  onChange,
}: {
  value?: {
    province?: string;
    department?: string;
    city?: string;
  };

  onChange: (value: {
    province: string;
    department: string;
    city: string;
  }) => void;
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

    useEffect(() => {
  if (!value) return;

  setProvince(
    value.province ?? ""
  );

  setDepartment(
    value.department ?? ""
  );
}, [value]);

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

      <select
  className="h-10 rounded-md border border-border bg-black/20 px-3 text-sm"
  value={value?.city ?? ""}
  onChange={(e) =>
    onChange({
      province,
      department,
      city: e.target.value,
    })
  }
  disabled={!department}
>
  <option value="">
    Localidad
  </option>

  {cities.map((city) => (
    <option
      key={city.city}
      value={city.city}
    >
      {city.city}
    </option>
  ))}
</select>
    </div>
  );
}