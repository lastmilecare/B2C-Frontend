import React, { useState } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";

const AppointmentList = () => {
  const navigate = useNavigate();

  const [appointments] = useState([
    {
      id: 1,
      patientName: "Ravi Kumar",
      appointmentDate: "2026-04-15",
      appointmentTime: "10:30",
      doctor: "Dr. Sharma",
      location: "Noida OHC",
      status: "Scheduled",
    },
    {
      id: 2,
      patientName: "Amit Singh",
      appointmentDate: "2026-04-16",
      appointmentTime: "12:00",
      doctor: "Dr. Gupta",
      location: "Delhi OHC",
      status: "Completed",
    },
    {
      id: 3,
      patientName: "Neha Verma",
      appointmentDate: "2026-04-17",
      appointmentTime: "02:15",
      doctor: "Dr. Khan",
      location: "Plant Site",
      status: "Pending",
    },
  ]);


  const [tempFilters, setTempFilters] = useState({
    patientName: "",
    doctor: "",
    location: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const [filters, setFilters] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

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
      patientName: "",
      doctor: "",
      location: "",
      status: "",
      startDate: "",
      endDate: "",
    };
    setTempFilters(reset);
    setFilters({});
  };

 
  const filteredAppointments = appointments.filter((item) => {
    const { patientName, doctor, location, status, startDate, endDate } = filters;

    return (
      (!patientName ||
        item.patientName.toLowerCase().includes(patientName.toLowerCase())) &&
      (!doctor || item.doctor === doctor) &&
      (!location || item.location === location) &&
      (!status || item.status === status) &&
      (!startDate || item.appointmentDate >= startDate) &&
      (!endDate || item.appointmentDate <= endDate)
    );
  });

 
  const filtersConfig = [
    {
      label: "Patient Name",
      name: "patientName",
      type: "text",
    },
    {
      label: "Doctor",
      name: "doctor",
      type: "select",
      options: [
        { label: "Dr. Sharma", value: "Dr. Sharma" },
        { label: "Dr. Gupta", value: "Dr. Gupta" },
        { label: "Dr. Khan", value: "Dr. Khan" },
      ],
    },
    {
      label: "Location",
      name: "location",
      type: "select",
      options: [
        { label: "Noida OHC", value: "Noida OHC" },
        { label: "Delhi OHC", value: "Delhi OHC" },
        { label: "Plant Site", value: "Plant Site" },
      ],
    },
    {
      label: "Status",
      name: "status",
      type: "select",
      options: [
        { label: "Scheduled", value: "Scheduled" },
        { label: "Completed", value: "Completed" },
        { label: "Pending", value: "Pending" },
      ],
    },
    {
      label: "Date From",
      name: "startDate",
      type: "date",
    },
    {
      label: "Date To",
      name: "endDate",
      type: "date",
    },
  ];

  
  const columns = [
    {
      name: "Patient",
      selector: (row) => row.patientName,
    },
    {
      name: "Date",
      selector: (row) => row.appointmentDate,
    },
    {
      name: "Time",
      selector: (row) => row.appointmentTime,
    },
    {
      name: "Doctor",
      selector: (row) => row.doctor,
    },
    {
      name: "Location",
      selector: (row) => row.location,
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded-full font-semibold
            ${
              row.status === "Completed"
                ? "bg-green-100 text-green-700"
                : row.status === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-blue-100 text-blue-700"
            }
          `}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">

      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Appointment List
      </h1>

     
      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

  
      <PatientTable
        title="Appointment List"
        data={filteredAppointments}
        columns={columns}
        totalRows={filteredAppointments.length}
        currentPage={1}
        perPage={10}
        onPageChange={() => {}}
        onPerPageChange={() => {}}
        isLoading={false}

        onEdit={(row) => {
          navigate(`/appointment/${row.id}`);
        }}

        onDelete={(row) => {
          console.log("Delete", row);
        }}
      />

    </div>
  );
};

export default AppointmentList;