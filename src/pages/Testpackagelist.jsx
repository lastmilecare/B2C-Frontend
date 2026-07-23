import React, { useState } from "react";
import { BeakerIcon } from "@heroicons/react/24/outline";
import {
  useGetPackageListQuery,
  useDeletePackageMutation,
} from "../redux/apiSlice";
import CopyFilterBar from "../components/Updates/Filter";
import CommonList from "../components/CommonList";
import { healthAlert } from "../utils/healthSwal";
import { formatDate, formatTime } from "../utils/helper";

const TestPackageList = ({ onEdit }) => {

  // ================= State =================

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [tempFilters, setTempFilters] = useState({
    package_name: "",
    package_type: "",
    startDate: "",
    endDate: "",
  });

  const [filters, setFilters] = useState({});

  // ================= API =================

  const {
    data,
    isLoading,
    isFetching,
  } = useGetPackageListQuery({
    page,
    limit,
    ...filters,
  });

  const [deletePackage] = useDeletePackageMutation();

  const packages = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  // ================= Filters =================

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    const reset = {
      package_name: "",
      package_type: "",
      startDate: "",
      endDate: "",
    };

    setTempFilters(reset);
    setFilters({});
    setPage(1);
  };

  const filtersConfig = [
    {
      label: "Package Name",
      name: "package_name",
      type: "text",
    },
    {
      label: "Package Type",
      name: "package_type",
      type: "select",
      options: [
        {
          label: "Basic",
          value: "BS",
        },
        {
          label: "Advanced",
          value: "AD",
        },
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

  // ================= Delete =================

  const handleDelete = async (row) => {
    const result = await healthAlert({
      title: "Are you sure?",
      text: `Delete "${row.package_name}" ?`,
      type: "confirm",
    });

    if (!result.isConfirmed) return;

    try {
      await deletePackage({
        id: row.id,
      }).unwrap();

      healthAlert({
        title: "Deleted",
        text: "Package deleted successfully.",
        type: "success",
      });

    } catch (err) {
      healthAlert({
        title: "Error",
        text: err?.data?.message || "Delete failed",
      });
    }
  };

  // ================= Columns =================

  const columns = [
    {
      name: "SL No",
      width: "80px",
      cell: (_, index) => index + 1,
    },
    {
      name: "Package",
      grow: 2,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="bg-sky-100 p-2 rounded-xl">
            <BeakerIcon className="w-5 h-5 text-sky-700" />
          </div>

          <div>
            <p className="font-semibold">
              {row.package_name}
            </p>

            <p className="text-xs text-gray-500">
              {row.external_id}
            </p>
          </div>
        </div>
      ),
    },
    {
      name: "Type",
      center: true,
      cell: (row) => (
        <span className="px-3 py-1 rounded-full bg-sky-50 border text-sky-700 text-xs">
          {row.package_type}
        </span>
      ),
    },
    {
      name: "Price",
      center: true,
      selector: (row) =>
        row.package_price
          ? `₹ ${row.package_price}`
          : "-",
    },
    {
      name: "Added On",
      cell: (row) => (
        <div>
          <div>{formatDate(row.createdAt)}</div>
          <div className="text-xs text-gray-400">
            {formatTime(row.createdAt)}
          </div>
        </div>
      ),
    },
  ];

  // ================= Return =================

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">

      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={(e) =>
          setTempFilters({
            ...tempFilters,
            [e.target.name]: e.target.value,
          })
        }
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <div className="mt-8 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">

        <CommonList
          title="Package List"
          data={packages}
          columns={columns}
          isLoading={isLoading || isFetching}
          totalRows={pagination.total || 0}
          currentPage={pagination.page || page}
          perPage={limit}
          onPageChange={(p) => setPage(p)}
          onPerPageChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          onDelete={handleDelete}
          onEdit={onEdit}
          enableActions
          actionButtons={["edit", "delete"]}
        />

      </div>

    </div>
  );
};

export default TestPackageList;