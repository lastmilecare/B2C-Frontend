import React, { useState } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";

const FitnessCertificateList = () => {
  const navigate = useNavigate();
  const [records] = useState([
    {
      id: 1,
      billno: "4001",
      patientName: "Ravi Kumar",
      uhid: "UH123",
      certNo: "CERT-1001",
      issueDate: "2026-04-10",
      validity: "6 Months",
      fitnessStatus: "Fit",
      doctor: "Dr. Sharma",
    },
    {
      id: 2,
      billno: "4002",
      patientName: "Amit Singh",
      uhid: "UH124",
      certNo: "CERT-1002",
      issueDate: "2026-04-12",
      validity: "3 Months",
      fitnessStatus: "Unfit",
      doctor: "Dr. Gupta",
    },
    {
      id: 3,
      billno: "4003",
      patientName: "Neha Verma",
      uhid: "UH125",
      certNo: "CERT-1003",
      issueDate: "2026-04-15",
      validity: "1 Year",
      fitnessStatus: "Fit",
      doctor: "Dr. Khan",
    },
  ]);

  const [tempFilters, setTempFilters] = useState({
    patientName: "",
    billno: "",
    uhid: "",
    fitnessStatus: "",
    doctor: "",
    fromDate: "",
    toDate: "",
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
      billno: "",
      uhid: "",
      fitnessStatus: "",
      doctor: "",
      fromDate: "",
      toDate: "",
    };
    setTempFilters(reset);
    setFilters({});
  };

  const filteredData = records.filter((item) => {
    const {
      patientName,
      billno,
      uhid,
      fitnessStatus,
      doctor,
      fromDate,
      toDate,
    } = filters;

    return (
      (!patientName ||
        item.patientName.toLowerCase().includes(patientName.toLowerCase())) &&

      (!billno || item.billno.includes(billno)) &&

      (!uhid ||
        item.uhid.toLowerCase().includes(uhid.toLowerCase())) &&

      (!fitnessStatus || item.fitnessStatus === fitnessStatus) &&

      (!doctor ||
        item.doctor.toLowerCase().includes(doctor.toLowerCase())) &&

      (!fromDate || item.issueDate >= fromDate) &&
      (!toDate || item.issueDate <= toDate)
    );
  });

  
  const filtersConfig = [
    {
      label: "Patient Name",
      name: "patientName",
      type: "text",
    },
    {
      label: "Bill No",
      name: "billno",
      type: "text",
    },
    {
      label: "UHID",
      name: "uhid",
      type: "text",
    },
    {
      label: "Fitness Status",
      name: "fitnessStatus",
      type: "select",
      options: [
        { label: "Fit", value: "Fit" },
        { label: "Unfit", value: "Unfit" },
      ],
    },
    {
      label: "Doctor",
      name: "doctor",
      type: "text",
    },
    {
      label: "Date Form",
      name: "fromDate",
      type: "date",
    },
    {
      label: "Date To",
      name: "toDate",
      type: "date",
    },
  ];

  const columns = [
    {
      name: "Certificate No",
      selector: (row) => row.certNo,
    },
    {
      name: "Patient",
      selector: (row) => row.patientName,
    },
    {
      name: "UHID",
      selector: (row) => row.uhid,
    },
    {
      name: "Bill No",
      selector: (row) => row.billno,
    },
    {
      name: "Issue Date",
      selector: (row) => row.issueDate,
    },
    {
      name: "Validity",
      selector: (row) => row.validity,
    },
    {
      name: "Fitness",
      selector: (row) => row.fitnessStatus,
    },
    {
      name: "Doctor",
      selector: (row) => row.doctor,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">

      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Fitness Certificate List
      </h1>

      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      
      <PatientTable
        title="Fitness Certificates"
        data={filteredData}
        columns={columns}
        totalRows={filteredData.length}
        currentPage={1}
        perPage={10}
        onPageChange={() => {}}
        onPerPageChange={() => {}}
        isLoading={false}

        onEdit={(row) => {
          navigate(`/fitness-certificate/${row.id}`);
        }}

        onDelete={(row) => {
          console.log("Delete", row);
        }}
      />

    </div>
  );
};

export default FitnessCertificateList;