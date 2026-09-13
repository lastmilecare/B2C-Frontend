import React, { useMemo, useState } from "react";
import {
  useGetCentersQuery,
  useDeleteDepartmentMutation,
  useToggleDepartmentStatusMutation,
  useGetDepartmentListQuery,
} from "../redux/apiSlice";

import CommonList from "../components/CommonList";
import CopyFilterBar from "../components/Updates/Filter";
import { healthAlert } from "../utils/healthSwal";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils/helper";

const DepartmentList = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [tempFilters, setTempFilters] = useState({
    name: "",
    code: "",
    center_id: "",
    startDate: "",
    endDate: "",
  });

  const [filters, setFilters] = useState({});

  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetDepartmentListQuery(
    {
      page,
      limit,
      ...filters,
    },
    {
      skip: !page || !limit,
    },
  );
  const [deleteDepartment] = useDeleteDepartmentMutation();

  const [toggleStatus] = useToggleDepartmentStatusMutation();

  /* -----------------------------------------
     CENTERS
  ----------------------------------------- */

  const { data: centersData } = useGetCentersQuery({
    page: 1,
    limit: 1000,
  });

  const centers = centersData?.data?.data || [];

  const centerMap = useMemo(() => {
    const map = {};

    centers.forEach((center) => {
      map[center.id] =
        center.project_name || center.name || `Center #${center.id}`;
    });

    return map;
  }, [centers]);

  /* -----------------------------------------
     DEPARTMENT DATA
  ----------------------------------------- */

  const departments = data?.data || [];

  const pagination = data?.data?.pagination || {
    currentPage: page,
    totalRecords: 0,
  };

  /* -----------------------------------------
     FILTER CONFIG
  ----------------------------------------- */

  const filtersConfig = [
    {
      label: "Department Name",
      name: "name",
      type: "text",
    },

    {
      label: "Department Code",
      name: "code",
      type: "text",
    },

    // {
    //   label: "OHC Center",
    //   name: "center_id",
    //   type: "select",
    //   options: [
    //     {
    //       label: "All Centers",
    //       value: "",
    //     },

    //     ...centers.map((center) => ({
    //       label: center.project_name || center.name || `Center #${center.id}`,
    //       value: center.id,
    //     })),
    //   ],
    // },

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

  /* -----------------------------------------
     RESET
  ----------------------------------------- */

  const handleResetFilters = () => {
    setTempFilters({
      name: "",
      code: "",
      // center_id: "",
      startDate: "",
      endDate: "",
    });

    setFilters({});
    setPage(1);
  };

  /* -----------------------------------------
     APPLY FILTERS
  ----------------------------------------- */

  const handleApplyFilters = () => {
    const today = new Date().toISOString().split("T")[0];

    const { startDate, endDate } = tempFilters;

    if (endDate && endDate > today) {
      healthAlert({
        title: "Department List",
        text: "End date cannot be greater than today.",
        icon: "info",
      });

      return;
    }

    if (startDate && endDate && startDate > endDate) {
      healthAlert({
        title: "Department List",
        text: "Start date cannot be after end date.",
        icon: "info",
      });

      return;
    }

    const appliedFilters = {
      ...tempFilters,
    };

    Object.keys(appliedFilters).forEach((key) => {
      if (
        appliedFilters[key] === "" ||
        appliedFilters[key] === null ||
        appliedFilters[key] === undefined
      ) {
        delete appliedFilters[key];
      }
    });

    setFilters(appliedFilters);
    setPage(1);
  };

  /* -----------------------------------------
     DELETE
  ----------------------------------------- */

  const handleDelete = async (row) => {
    try {
      await deleteDepartment(row.id).unwrap();

      healthAlert({
        title: "Deleted",
        text: "Department deleted successfully",
        icon: "success",
      });

      refetch();
    } catch (err) {
      healthAlert({
        title: "Error",
        text: err?.data?.message || "Delete failed",
        icon: "error",
      });
    }
  };

  /* -----------------------------------------
     TOGGLE STATUS
  ----------------------------------------- */

  const handleToggle = async (row) => {
    try {
      await toggleStatus(row.id).unwrap();

      healthAlert({
        title: "Success",
        text: "Department status updated successfully",
        icon: "success",
      });

      refetch();
    } catch (err) {
      healthAlert({
        title: "Error",
        text: err?.data?.message || "Status update failed",
        icon: "error",
      });
    }
  };

  /* -----------------------------------------
     EDIT
  ----------------------------------------- */

  const handleEdit = (row) => {
    if (!row || !row.id) {
      healthAlert({
        title: "Error",
        text: "Department ID not found for this record.",
        icon: "error",
      });

      return;
    }

    navigate(`/departments/${row.id}`, {
      state: {
        editData: row,
      },
    });
  };

  /* -----------------------------------------
     COLUMNS
  ----------------------------------------- */

  const columns = [
    {
      name: "SL No",
      selector: (_, index) => (pagination.currentPage - 1) * limit + index + 1,
      width: "80px",
    },

    {
      name: "Department Name",
      selector: (row) => row.name || "N/A",
      sortable: true,
    },

    {
      name: "Code",
      selector: (row) => row.code || "N/A",
      sortable: true,
    },

    {
      name: "Description",
      selector: (row) => row.description || "N/A",
      cell: (row) => (
        <span className="max-w-[150px] truncate" title={row.description || ""}>
          {row.description || "N/A"}
        </span>
      ),
    },
    

    {
      name: "OHC Center",
      selector: (row) => centerMap[row.center_id] || "Universal",
    },

    {
      name: "Status",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded ${
            row.is_active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },

    {
      name: "Modified Date",
      selector: (row) => formatDate(row.modified_date),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Department List</h1>

      {/* FILTER */}
      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onChange={(e) =>
          setTempFilters({
            ...tempFilters,
            [e.target.name]: e.target.value,
          })
        }
      />

      {/* LIST */}
      <CommonList
        data={departments}
        columns={columns}
        isLoading={isLoading}
        title="Department List"
        totalRows={pagination.totalRecords || 0}
        currentPage={pagination.currentPage || page}
        perPage={limit}
        onPageChange={(newPage) => setPage(newPage)}
        onPerPageChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        enableActions
        actionButtons={["edit", "delete"]}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default DepartmentList;
