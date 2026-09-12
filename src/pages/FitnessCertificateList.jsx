import React, { useState } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";
import {
  useGetFitnessCertificatesQuery,
  useDeleteFitnessMutation,
  useDownloadFitnessCertificatePdfMutation,
} from "../redux/apiSlice";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { healthAlerts } from "../utils/healthSwal";
import { getApiErrorMessage, downloadBlob } from "../utils/helper";

const FitnessCertificateList = () => {
  const navigate = useNavigate();
  const { data: records = [], isLoading } = useGetFitnessCertificatesQuery();
  const [deleteFitness] = useDeleteFitnessMutation();
  const [downloadPdf] = useDownloadFitnessCertificatePdfMutation();
  const [downloadingId, setDownloadingId] = useState(null);

  const [tempFilters, setTempFilters] = useState({
    workmanName: "",
    trade: "",
    sex: "",
    fromDate: "",
    toDate: "",
  });

  const [filters, setFilters] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
  };

  const handleResetFilters = () => {
    const reset = {
      workmanName: "",
      trade: "",
      sex: "",
      fromDate: "",
      toDate: "",
    };
    setTempFilters(reset);
    setFilters({});
  };

  const formattedData = records.map((item) => ({
    id: item.id,
    certNo: item.certificate_number,
    workmanName: item.workman_name,
    trade: item.trade,
    sex: item.sex,
    createdAt: item.created_at?.split("T")[0],
    raw: item,
  }));

  const filteredData = formattedData.filter((item) => {
    const { workmanName, trade, sex, fromDate, toDate } = filters;

    return (
      (!workmanName ||
        item.workmanName?.toLowerCase().includes(workmanName.toLowerCase())) &&
      (!trade || item.trade?.toLowerCase().includes(trade.toLowerCase())) &&
      (!sex || item.sex?.toLowerCase() === sex.toLowerCase()) &&
      (!fromDate || item.createdAt >= fromDate) &&
      (!toDate || item.createdAt <= toDate)
    );
  });

  const onDownloadPdf = async (row) => {
    try {
      setDownloadingId(row.id);
      const blob = await downloadPdf(row.id).unwrap();
      downloadBlob(
        blob,
        `Fitness-Certificate-${row.certNo || row.id}.pdf`,
      );
    } catch (err) {
      healthAlerts.error(getApiErrorMessage(err, "PDF download failed"), "Error");
    } finally {
      setDownloadingId(null);
    }
  };

  const filtersConfig = [
    { label: "Workman Name", name: "workmanName", type: "text" },
    { label: "Trade", name: "trade", type: "text" },
    {
      label: "Sex",
      name: "sex",
      type: "select",
      options: [
        { label: "All", value: "" },
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" },
      ],
    },
    { label: "Date From", name: "fromDate", type: "date" },
    { label: "Date To", name: "toDate", type: "date" },
  ];

  const columns = [
    { name: "Certificate No", selector: (row) => row.certNo },
    { name: "Workman Name", selector: (row) => row.workmanName },
    { name: "Trade", selector: (row) => row.trade },
    { name: "Sex", selector: (row) => row.sex },
    { name: "Created On", selector: (row) => row.createdAt },
    {
      name: "Certificate",
      cell: (row) => (
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer text-blue-600 hover:text-blue-800 disabled:opacity-50"
          onClick={() => onDownloadPdf(row)}
          disabled={downloadingId === row.id}
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          {downloadingId === row.id ? "Downloading..." : "Download PDF"}
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
        enableAdd
        addButtonText="Add Certificate"
        onAdd={() =>
          navigate("/fitness-certificate", {
            state: { goToForm: true },
          })
        }
        onEdit={(row) => {
          navigate(`/fitness-certificate/${row.id}`, {
            state: { goToForm: true },
          });
        }}
        onDelete={async (row) => {
          try {
            await deleteFitness(row.id).unwrap();
            healthAlerts.success("Deleted successfully", "Deleted");
          } catch (err) {
            healthAlerts.error(getApiErrorMessage(err, "Delete failed"), "Error");
          }
        }}
      />

    </div>
  );
};

export default FitnessCertificateList;
