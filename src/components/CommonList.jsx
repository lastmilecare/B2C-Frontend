import React, { useState, Fragment, useMemo } from "react";
import DataTable from "react-data-table-component";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";

const CommonList = ({
  title = "Records",
  columns = [],
  data = [],
  filters = [],
  enableActions = false, // 👈 Action buttons toggle
  enableExport = false,  // 👈 Export button toggle
  onEdit = () => {},
  onView = () => {},
  onDelete = () => {},
  onExport = () => {},   // 👈 Export click handler
  onFilterChange = () => {},
  onRowClick = () => {},
  searchPlaceholder = "Search...",
}) => {
  const [search, setSearch] = useState("");

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#f8fafc",
        color: "#0369a1",
        fontWeight: "600",
        fontSize: "14px",
      },
    },
    rows: {
      style: {
        fontSize: "14px",
        color: "#334155",
        "&:hover": {
          backgroundColor: "#e0f2fe",
        },
        position: "relative",
        zIndex: 0,
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #e2e8f0",
        paddingTop: "8px",
      },
    },
  };

  const filteredData = data.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ✅ Add Actions column only if enabled
  const enhancedColumns = useMemo(() => {
    if (!enableActions) return columns;

    return [
      ...columns,
      {
        name: "Actions",
        cell: (row) => (
          <Menu as="div" className="relative inline-block text-left z-50">
            <Menu.Button className="p-1 rounded-full hover:bg-sky-100">
              <EllipsisVerticalIcon className="w-5 h-5 text-sky-600" />
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
              <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg focus:outline-none z-[999]">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onView(row)}
                      className={`${
                        active ? "bg-sky-50" : ""
                      } block w-full text-left px-4 py-2 text-sm text-sky-700`}
                    >
                      View
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onEdit(row)}
                      className={`${
                        active ? "bg-sky-50" : ""
                      } block w-full text-left px-4 py-2 text-sm text-yellow-600`}
                    >
                      Edit
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onDelete(row)}
                      className={`${
                        active ? "bg-sky-50" : ""
                      } block w-full text-left px-4 py-2 text-sm text-red-600`}
                    >
                      Delete
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        ),
        width: "100px",
        center: true,
      },
    ];
  }, [columns, enableActions, onEdit, onDelete, onView]);

  return (
    <div className="bg-white shadow-md rounded-xl p-5 border border-gray-100 relative">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-5 gap-3">
        <h2 className="text-xl font-semibold text-sky-700">{title}</h2>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Export Button */}
         

          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-3 py-2 w-full border rounded-lg focus:ring-2 focus:ring-sky-400 focus:outline-none text-sm"
            />
          </div>

          {/* Filters */}
          {filters.length > 0 && (
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="inline-flex items-center gap-1 bg-sky-600 text-white px-3 py-2 rounded-lg hover:bg-sky-700">
                <FunnelIcon className="w-5 h-5" />
                Filter
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
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg focus:outline-none z-10">
                  {filters.map((filter, idx) => (
                    <Menu.Item key={idx}>
                      {({ active }) => (
                        <button
                          onClick={() => onFilterChange(filter.value)}
                          className={`${
                            active ? "bg-sky-100" : ""
                          } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                        >
                          {filter.label}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>
          )}
           {enableExport && (
            <button
              onClick={onExport}
              className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={enhancedColumns}
        data={filteredData}
        pagination
        highlightOnHover
        pointerOnHover
        onRowClicked={onRowClick}
        customStyles={customStyles}
      />
    </div>
  );
};

export default CommonList;
