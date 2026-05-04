import React, { useState } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";
import {
  useGetFitnessCertificatesQuery,
  useDeleteFitnessMutation,
} from "../redux/apiSlice";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
const FitnessCertificateList = () => {
  const navigate = useNavigate();
  const { data: records = [], isLoading } = useGetFitnessCertificatesQuery();
  const [deleteFitness] = useDeleteFitnessMutation();

  const [tempFilters, setTempFilters] = useState({
    patientName: "",

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

      fitnessStatus: "",
      doctor: "",
      fromDate: "",
      toDate: "",
    };
    setTempFilters(reset);
    setFilters({});
  };
  const formattedData = records.map((item) => ({
    id: item.id,
    patientName: item.name,
    certNo: item.certificate_number,
    issueDate: item.issue_date?.split("T")[0],
    validity: item.valid_till,
    fitnessStatus: item.fitness_status,
    doctor: item.doctor_signature,
    pdfUrl: item.pdf_url,
  }));
  const filteredData = formattedData.filter((item) => {
    const { patientName, fitnessStatus, doctor, fromDate, toDate } = filters;

    return (
      (!patientName ||
        item.patientName?.toLowerCase().includes(patientName.toLowerCase())) &&
      (!fitnessStatus || item.fitnessStatus === fitnessStatus) &&
      (!doctor || item.doctor?.toLowerCase().includes(doctor.toLowerCase())) &&
      (!fromDate || item.issueDate >= fromDate) &&
      (!toDate || item.issueDate <= toDate)
    );
  });
  const BASE_URL = import.meta.env.VITE_API_URL || "https://api.example.com";

  const handleDownload = async (row) => {
    if (!row.pdfUrl) {
      healthAlerts.error("PDF not available");
      return;
    }

    try {
      const url = `${BASE_URL}${row.pdfUrl}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error("Failed to fetch PDF");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${row.certNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl); // cleanup
    } catch (err) {
      healthAlerts.error("Download failed");
      console.error(err);
    }
  };
  const filtersConfig = [
    {
      label: "Patient Name",
      name: "patientName",
      type: "text",
    },

    {
      label: "Fitness Status",
      name: "fitnessStatus",
      type: "select",
      options: [
        { label: "Fit", value: "FIT" },
        { label: "Fit with Restrictions", value: "FIT_WITH_RESTRICTIONS" },
        { label: "Unfit", value: "UNFIT" },
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
    {
      name: "Download",
      cell: (row) => (
        <button
          className="flex items-center gap-2 cursor-pointer text-blue-600 hover:text-blue-800"
          onClick={() => handleDownload(row)}
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
        </button>
      ),
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
        isLoading={isLoading}
        onEdit={(row) => {
          navigate(`/fitness-certificate/${row.id}`);
        }}
        onDelete={async (row) => {
          try {
            await deleteFitness(row.id).unwrap();
            healthAlerts.success("Deleted Successfully");
          } catch {
            healthAlerts.error("Delete Failed");
          }
        }}
      />
    </div>
  );
};

export default FitnessCertificateList;
