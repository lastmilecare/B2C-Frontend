import React, { useState } from "react";
import {
  useGetCentersQuery,
  useDeleteCenterMutation,
  useToggleCenterStatusMutation,
  useGetTenantsQuery,
} from "../redux/apiSlice";
import CommonList from "../components/CommonList";
import { healthAlert } from "../utils/healthSwal";
import { useNavigate } from "react-router-dom";
import CopyFilterBar from "../components/Updates/Filter";
import { formatDate } from "../utils/helper";
const CenterList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [tempFilters, setTempFilters] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [filters, setFilters] = useState({});
  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useGetCentersQuery(
    {
      page,
      limit,
      ...filters,
    },
    { skip: !page || !limit },
  );
  const [deleteCenter] = useDeleteCenterMutation();
  const [toggleStatus] = useToggleCenterStatusMutation();
  const centers = data?.data?.data || [];
  const { data: tenantsData } = useGetTenantsQuery();
  const tenants = tenantsData?.data?.data || [];
  const tenantMap = React.useMemo(() => {
    const map = {};
    tenants.forEach((t) => {
      map[t.id] = t.name;
    });
    return map;
  }, [tenants]);
  const pagination = data?.data?.pagination || {
    currentPage: page,
    totalRecords: 0,
  };
  const filtersConfig = [
    { label: "Name", name: "name", type: "text" },
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
  const handleResetFilters = () => {
    setTempFilters({
      name: "",
      startDate: "",
      endDate: "",
    });
    setFilters({});
    setPage(1);
  };
  const handleDelete = async (row) => {
    try {
      await deleteCenter(row.id).unwrap();
      healthAlert({
        title: "Deleted",
        text: "Center deleted",
        icon: "success",
      });
      refetch();
    } catch {
      healthAlert({ title: "Error", text: "Delete failed", icon: "error" });
    }
  };

  const handleToggle = async (row) => {
    try {
      await toggleStatus(row.id).unwrap();
      refetch();
    } catch {
      healthAlert({
        title: "Error",
        text: "Status update failed",
        icon: "error",
      });
    }
  };

  const handleEdit = (row) => {
    if (!row || !row.id) {
      healthAlert({
        title: "Error",
        text: "Center ID not found for this record.",
        icon: "error",
      });
      return;
    }
    navigate(`/centers/${row.id}`, {
      state: {
        editData: row,
      },
    });
  };
  const handleApplyFilters = () => {
    const today = new Date().toISOString().split("T")[0];
    const { startDate, endDate } = tempFilters;

    if (endDate && endDate > today) {
      healthAlert({
        title: "Center List",
        text: `End date cannot be greater than today.`,
        icon: "info",
      });
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      healthAlert({
        title: "Center List",
        text: `Start date cannot be after end date.`,
        icon: "info",
      });
      return;
    }

    setFilters(tempFilters);
    setPage(1);
  };

  const columns = [
    {
      name: "SL No",
      selector: (_, x) => x + 1,
    },
    {
      name: "Project Name",
      selector: (row) => row.project_name,
    },
    {
      name: "Project Address",
      selector: (row) => row.project_address,
    },
    {
      name: "agency_name",
      selector: (row) => row.agency_name,
    },

    {
      name: "Agency Spoc Contact Number",
      selector: (row) => row.agency_spoc_contact_number,
    },
    {
      name: "Agency State",
      selector: (row) => row.agency_state,
    },
    {
      name: "Agency Spoc Email",
      selector: (row) => row.agency_spoc_email,
    },

    {
      name: "Tenant Name",
      selector: (row) => tenantMap[row.tenant_id] || "N/A",
    },
    {
  name: "Created At",
  selector: (row) =>
    formatDate(row.createdAt),
},
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded ${
            row.status
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {row.status ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Center List</h1>
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
      <CommonList
        data={centers}
        columns={columns}
        isLoading={isLoading}
        title="Center list"
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

export default CenterList;
