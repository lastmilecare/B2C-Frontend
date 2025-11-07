import React, { useState, Fragment, useMemo } from "react";
import DataTable from "react-data-table-component";
import { EllipsisVerticalIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";

const CommonList = ({
  title = "Records",
  columns = [],
  data = [],
  totalRows = 0,
  currentPage = 1,
  perPage = 10,
  onPageChange = () => { },
  onPerPageChange = () => { },
  enableActions = false,
  enableExport = false,
  onEdit = () => { },
  onView = () => { },
  onDelete = () => { },
  onExport = () => { },
  isLoading = false,
  filtersConfig = [],
  onFilterApply = () => { },
}) => {
  const [tempFilters, setTempFilters] = useState({});
  const today = new Date().toISOString().split("T")[0];

  // 🔹 Handle Filter Changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Apply Filters
  const handleApply = () => {
    const { startDate, endDate } = tempFilters;
    if (endDate && endDate > today) {
      alert("End date cannot be greater than today.");
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      alert("Start date cannot be after end date.");
      return;
    }
    onFilterApply(tempFilters);
  };

  // 🔹 Reset Filters
  const handleReset = () => {
    setTempFilters({});
    onFilterApply({});
  };

  // 🔹 Table Styles
  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#f8fafc",
        color: "#0369a1",
        fontWeight: "600",
        fontSize: "11px",
        padding: "6px 8px",
      },
    },
    rows: {
      style: {
        fontSize: "11px",
        color: "#334155",
        minHeight: "32px",
        "&:hover": { backgroundColor: "#e0f2fe" },
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #e2e8f0",
        fontSize: "11px",
        padding: "4px",
      },
    },
  };

  const visibleColumns = useMemo(
    () =>
      columns
        .filter((col) => !col.hidden)
        .map((col) => ({
          ...col,
          width: col.width || "auto",
          minWidth: col.minWidth || "100px",
          wrap: col.wrap ?? true,
        })),
    [columns]
  );

  const enhancedColumns = useMemo(() => {
    if (!enableActions) return visibleColumns;
    return [
      ...visibleColumns,
      {
        name: "Actions",
        cell: (row) => (
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="p-1 rounded hover:bg-sky-100">
              <EllipsisVerticalIcon className="w-4 h-4 text-sky-600" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded shadow-lg z-[9999]">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onView(row)}
                      className={`${active ? "bg-sky-50" : ""} block w-full text-left px-2 py-1 text-xs text-sky-700`}
                    >
                      View
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onEdit(row)}
                      className={`${active ? "bg-sky-50" : ""} block w-full text-left px-2 py-1 text-xs text-yellow-600`}
                    >
                      Edit
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onDelete(row)}
                      className={`${active ? "bg-sky-50" : ""} block w-full text-left px-2 py-1 text-xs text-red-600`}
                    >
                      Delete
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        ),
        width: "70px",
        center: true,
        ignoreRowClick: true,
      },
    ];
  }, [visibleColumns, enableActions, onEdit, onDelete, onView]);

  return (
    <div className="bg-white shadow-md rounded-xl p-3 border border-gray-100">
      {/* 🔹 Header */}
      <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
        <h2 className="text-base font-semibold text-sky-700">{title}</h2>
        {enableExport && (
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-xs"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export
          </button>
        )}
      </div>

      {/* 🔹 Filters */}
      {filtersConfig.length > 0 && (
        <div className="w-full bg-sky-50 p-3 rounded-lg border border-sky-100 mb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {filtersConfig.map((filter) => (
              <div key={filter.name}>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  {filter.label}
                </label>

                {filter.type === "text" && (
                  <input
                    type="text"
                    name={filter.name}
                    value={tempFilters[filter.name] || ""}
                    onChange={handleFilterChange}
                    className="w-full border px-2 py-1 rounded text-xs focus:ring-1 focus:ring-sky-400"
                    placeholder={filter.placeholder || `Enter ${filter.label}`}
                  />
                )}

                {filter.type === "select" && (
                  <select
                    name={filter.name}
                    value={tempFilters[filter.name] || ""}
                    onChange={handleFilterChange}
                    className="w-full border px-2 py-1 rounded text-xs focus:ring-1 focus:ring-sky-400"
                  >
                    <option value="">Select</option>
                    {filter.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === "date" && (
                  <input
                    type="date"
                    name={filter.name}
                    value={tempFilters[filter.name] || ""}
                    onChange={handleFilterChange}
                    className="w-full border px-2 py-1 rounded text-xs focus:ring-1 focus:ring-sky-400"
                    max={filter.name === "endDate" ? today : tempFilters.endDate || today}
                  />
                )}
              </div>
            ))}
          </div>

          {/* 🔹 Filter Buttons */}
          <div className="flex flex-wrap justify-end gap-2 mt-3 border-t border-sky-100 pt-2">
            <button
              onClick={handleReset}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-300"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="bg-sky-600 text-white px-3 py-1 rounded text-xs hover:bg-sky-700"
            >
              Apply
            </button>
            {enableExport && (
              <button
                onClick={onExport}
                className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export
              </button>
            )}
          </div>
        </div>
      )}
      <DataTable
        columns={enhancedColumns}
        data={data}
        progressPending={isLoading}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationDefaultPage={currentPage}
        paginationPerPage={perPage}
        onChangeRowsPerPage={onPerPageChange}
        onChangePage={onPageChange}
        highlightOnHover
        pointerOnHover
        customStyles={customStyles}
        responsive
        dense
      />
    </div>
  );
};

export default CommonList;
