import React, { useState } from "react";

import PatientTable from "../components/Updates/PatientTable";

import CopyFilterBar from "../components/Updates/Filter";

import { useNavigate } from "react-router-dom";

import {
 useGetOhcCombinedListQuery,
  useSearchEmployeeQuery,
} from "../redux/apiSlice";

import { healthAlerts } from "../utils/healthSwal";

const PatientExaminationList = () => {

  const navigate = useNavigate();

  const {
    data,
    isLoading,
  } = useGetOhcCombinedListQuery();

//   const [deleteOhcCombined] =
//     useDeleteOhcCombinedMutation();

  

  const [tempFilters,
    setTempFilters] =
    useState({

      employee_id: "",
      name: "",
      fromDate: "",
      toDate: "",
    });

  const [filters,
    setFilters] =
    useState({});



  const {
    data: empSuggestions = [],
  } = useSearchEmployeeQuery(

    tempFilters.employee_id,

    {
      skip:
        !tempFilters.employee_id,
    }
  );

  

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setTempFilters((prev) => ({

      ...prev,

      [name]: value,
    }));
  };

 

  const handleApplyFilters = () => {

    setFilters(tempFilters);
  };



  const handleResetFilters = () => {

    const reset = {

      employee_id: "",
      name: "",
      fromDate: "",
      toDate: "",
    };

    setTempFilters(reset);

    setFilters({});
  };

  

  const records =
    (data?.data || []).map((item) => ({

      id: item.id,

      patient_id:
        item.selected_test?.patient?.patient_id,

      employee_id:
        item.selected_test?.patient?.employee_id,

      name:
        item.selected_test?.patient?.name,

      gender:
        item.selected_test?.patient?.gender,

      age:
        item.selected_test?.patient?.age,

      package_name:
        item.selected_package_name?.[0],

      bpsystolic:
        item.selected_test?.vitals?.bpsystolic,

      bpdiastolic:
        item.selected_test?.vitals?.bpdiastolic,

      pulserate:
        item.selected_test?.vitals?.pulserate,

      spo2:
        item.selected_test?.vitals?.spo2,

      bmi:
        item.selected_test?.vitals?.bmi,

      created_at:
        item.createdAt,
    }));

 

  const filteredData =
    records.filter((item) => {

      const {
        employee_id,
        name,
        fromDate,
        toDate,
      } = filters;

      const itemDate =
        item.created_at
          ?.split("T")[0];

      return (

        (!employee_id ||

          item.employee_id
            ?.toLowerCase()
            .includes(
              employee_id.toLowerCase()
            )
        )

        &&

        (!name ||

          item.name
            ?.toLowerCase()
            .includes(
              name.toLowerCase()
            )
        )

        &&

        (!fromDate ||
          itemDate >= fromDate)

        &&

        (!toDate ||
          itemDate <= toDate)
      );
    });

  

//   const handleDelete =
//     async (row) => {

//       try {

//         await deleteOhcCombined(
//           row.id
//         ).unwrap();

//         healthAlerts.success(
//           "Deleted Successfully"
//         );

//       } catch (err) {

//         healthAlerts.error(

//           err?.data?.message ||

//           "Delete Failed"
//         );
//       }
//     };

  

  const filtersConfig = [

    {
      label: "Employee ID",

      name: "employee_id",

      type: "text",

      suggestionConfig: {

        minLength: 1,

        keyField: "employeeId",

        valueField: "employeeId",
      },
    },

    {
      label: "Name",

      name: "name",

      type: "text",
    },

    {
      label: "From Date",

      name: "fromDate",

      type: "date",
    },

    {
      label: "To Date",

      name: "toDate",

      type: "date",
    },
  ];


  const columns = [

    {
      name: "Patient ID",

      selector:
        (row) => row.patient_id || "-",
    },

    {
      name: "Employee ID",

      selector:
        (row) => row.employee_id || "-",
    },

    {
      name: "Name",

      selector:
        (row) => row.name || "-",
    },

    {
      name: "Gender",

      selector:
        (row) => row.gender || "-",
    },

    {
      name: "Age",

      selector:
        (row) => row.age || "-",
    },

    {
      name: "Package",

      selector:
        (row) => row.package_name || "-",
    },

    {
      name: "BP",

      cell: (row) =>

        `${row.bpsystolic || "-"}
        /
        ${row.bpdiastolic || "-"}`,
    },

    {
      name: "Pulse",

      selector:
        (row) => row.pulserate || "-",
    },

    {
      name: "SPO2",

      selector:
        (row) => row.spo2 || "-",
    },

    {
      name: "BMI",

      selector:
        (row) => row.bmi || "-",
    },

    {
      name: "Date",

      selector: (row) =>

        row.created_at
          ?.split("T")[0],
    },
  ];

  return (

    <div className="max-w-7xl mx-auto">

      <h1 className="text-2xl font-semibold text-gray-700 mb-6">

        Patient Examination List

      </h1>

      {/* FILTER */}

      <CopyFilterBar

        filtersConfig={
          filtersConfig
        }

        tempFilters={
          tempFilters
        }

        onChange={
          handleChange
        }

        onApply={
          handleApplyFilters
        }

        onReset={
          handleResetFilters
        }

        suggestionsMap={{

          employee_id:
            empSuggestions,
        }}

        onSelectSuggestion={(
          field,
          value
        ) => {

          setTempFilters((prev) => ({

            ...prev,

            [field]: value,
          }));
        }}
      />

      {/* TABLE */}

      <PatientTable

        title="Patient Examination Records"

        data={filteredData}

        columns={columns}

        totalRows={
          filteredData.length
        }

        currentPage={1}

        perPage={10}

        onPageChange={() => {}}

        onPerPageChange={() => {}}

        isLoading={isLoading}

        // onEdit={(row) =>

        //   navigate(
        //     `/patient-examination/${row.id}`
        //   )
        // }

        onDelete={() => {}}
      />

    </div>
  );
};

export default PatientExaminationList;