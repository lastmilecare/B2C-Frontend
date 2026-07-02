import React, { useState, useMemo, useCallback } from "react";

import CommonList from "../components/CommonList";
import CopyFilterBar from "../components/Updates/Filter";

import { Picaso_Paymode_Options } from "../utils/constants";
import { healthAlert } from "../utils/healthSwal";

import {
  useGetPharmacyRevenueQuery,
  useDeletePharmacyRevenueMutation,
  useLazyExportPharmacyRevenueQuery,
} from "../redux/apiSlice";
import {
  formatDate,
  
} from "../utils/helper";
import { useNavigate } from "react-router-dom";

const PharmacyRevenueList = ({ onEdit }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({});
  const [tempFilters, setTempFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const [deleteRevenue] = useDeletePharmacyRevenueMutation();
  const [triggerExport] = useLazyExportPharmacyRevenueQuery();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useGetPharmacyRevenueQuery({
    page,
    limit,
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const revenues = data?.data || [];
  const totalRows = data?.total || 0;

 

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setTempFilters({ startDate: "", endDate: "" });
    setFilters({});
    setPage(1);
  };

 

  const handleEdit = useCallback(
    (row) => {
      onEdit?.(row);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [onEdit]
  );

  

  const handleDelete = async (row) => {
    try {
      await deleteRevenue(row.RevenueID).unwrap();
      healthAlert({
        title: "Success",
        text: "Revenue Deleted Successfully",
        icon: "success",
      });
      refetch();
    } catch (error) {
      healthAlert({
        title: "Error",
        text: error?.data?.message || "Delete Failed",
        icon: "error",
      });
    }
  };

  

  const handleExport = async () => {
    try {
      const file = await triggerExport({
        startDate: filters.startDate,
        endDate: filters.endDate,
      }).unwrap();

      const url = window.URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = "PharmacyRevenue.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      healthAlert({
        title: "Error",
        text: "Export Failed",
        icon: "error",
      });
    }
  };

  

  const totalRevenue = useMemo(
    () => revenues.reduce((sum, row) => sum + Number(row.RevenueAmount || 0), 0),
    [revenues]
  );

  const totalDue = useMemo(
    () => revenues.reduce((sum, row) => sum + Number(row.DueAmount || 0), 0),
    [revenues]
  );

  const grandTotal = totalRevenue + totalDue;

  

  const columns = [
    {
      name:"Sno",
      selector:(row, index) => (page - 1) * limit + index + 1,
      width:"80px"
    },
    {
      name: "Revenue ID",
      selector: (row) => row.RevenueID,
      width: "120px",
    },
    {
      name: "Revenue Date",
      selector: (row) => <div className="flex flex-col text-xs">
              <span className="font-medium text-slate-700">
               {formatDate(row.RevenueDate)}
              </span>
              </div>
    },
    {
      name: "Payment Mode",
      selector: (row) =>
        Picaso_Paymode_Options.find(
          (x) => Number(x.id) === Number(row.PaymentmodeID)
        )?.name || "-",
    },
    {
      name: "Amount",
      selector: (row) => Number(row.RevenueAmount).toFixed(2),
    },
    {
      name: "Due Amount",
      selector: (row) => Number(row.DueAmount || 0).toFixed(2),
    },
    {
      name: "Total",
      selector: (row) =>
        (Number(row.RevenueAmount || 0) + Number(row.DueAmount || 0)).toFixed(2),
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
    
      <CopyFilterBar
        filtersConfig={[
          { label: "Date From", name: "startDate", type: "date" },
          { label: "Date To", name: "endDate", type: "date" },
        ]}
        tempFilters={tempFilters}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onExport={handleExport}
      />

      
      <CommonList
        title="💰 Pharmacy Revenue List"
        columns={columns}
        data={revenues}
        totalRows={totalRows}
        currentPage={page}
        perPage={limit}
        onPageChange={setPage}
        onPerPageChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        enableActions
        actionButtons={["edit", "delete"]}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
          enableAdd
  addButtonText="Add"
  onAdd={() =>
    navigate("/pharmacy-revenue", {
      state: {
        goToForm: true,
      },
    })
  }
      />

      
      <section className="border rounded-xl bg-emerald-50 px-6 py-4 shadow-sm">
        <div className="flex flex-wrap justify-between items-center gap-3 text-sm">
          <div>
            Total Revenue :
            <span className="font-semibold ml-2 text-emerald-700">
              ₹{totalRevenue.toFixed(2)}
            </span>
          </div>

          <div>
            Total Due :
            <span className="font-semibold ml-2 text-orange-700">
              ₹{totalDue.toFixed(2)}
            </span>
          </div>

          <div>
            Grand Total :
            <span className="font-semibold ml-2 text-sky-700">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PharmacyRevenueList;
