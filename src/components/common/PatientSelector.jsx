import React, { useState } from "react";
import { useSearchNameFullQuery } from "../../redux/apiSlice";
import { baseInput } from "../FormControls";

const PatientSelector = ({ formik }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(false);

  const { data: suggestions = [] } = useSearchNameFullQuery(
  search,
  { skip: !search || search.length < 2 }
);

  const labelStyle = "text-sm text-gray-600 block mb-1";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <div className="relative">
        <label className={labelStyle}>
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Search Name"
          value={search || formik.values.Name}
          className={baseInput}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelected(false);
            formik.setValues({
              ...formik.values,
              patient_id: "",
              EmployeeId: "",
              Name: "",
              Age: "",
              Gender: "",
            });
          }}
        />

        
        {search && suggestions.length > 0 && !selected && (
          <ul className="absolute z-50 bg-white border rounded-md shadow-lg w-full max-h-48 overflow-auto mt-1">
            {suggestions.map((item) => (
              <li
                key={item.id}
                onClick={() => {
                  setSelected(true);
                  setSearch(item.name);
                  formik.setValues({
                    ...formik.values,
                    patient_id: item.id,
                    EmployeeId: item.employeeId,
                    Name: item.name,
                    Age: item.age,
                    Gender: item.gender,
                  });
                }}
                className="px-3 py-2 hover:bg-sky-100 cursor-pointer text-sm border-b last:border-none"
              >
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-gray-500"> Pat ID: {item.id}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

     
      <div>
        <label className={labelStyle}>Employee ID </label>
        <input
          value={formik.values.EmployeeId || ""}
          readOnly
          className={`${baseInput} bg-sky-50 cursor-not-allowed`}
          placeholder="Employee Id"
        />
      </div>

      
      <div>
        <label className={labelStyle}>Age</label>
        <input
          value={formik.values.Age || ""}
          readOnly
          className={`${baseInput} bg-sky-50 cursor-not-allowed`}
          placeholder="Age"
        />
      </div>

      
      <div>
        <label className={labelStyle}>Gender</label>
        <input
          value={formik.values.Gender || ""}
          readOnly
          className={`${baseInput} bg-sky-50 cursor-not-allowed`}
          placeholder="Gender"
        />
      </div>

      
      <div>
        <label className={labelStyle}>Patient ID</label>
        <input
          value={formik.values.patient_id || ""}
          readOnly
          className={`${baseInput} bg-sky-50 cursor-not-allowed`}
          placeholder="Patient Id"
        />
      </div>
    </div>
  );
};

export default PatientSelector;