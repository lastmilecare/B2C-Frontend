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
  enableActions = false,
  enableExport = false,
  onEdit = () => { },
  onView = () => { },
  onDelete = () => { },
  onExport = () => { },
  onFilterChange = () => { },
  onRowClick = () => { },
  searchPlaceholder = "Search...",
}) => {
  const [search, setSearch] = useState("");

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#f8fafc",
        color: "#0369a1",
        fontWeight: "600",
        fontSize: "11px",
        padding: "4px 6px",
        whiteSpace: "nowrap", // prevent wrapping
      },
    },
    rows: {
      style: {
        fontSize: "11px",
        color: "#334155",
        padding: "2px 6px",
        "&:hover": {
          backgroundColor: "#e0f2fe",
        },
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #e2e8f0",
        paddingTop: "2px",
        fontSize: "11px",
      },
    },
    cells: {
      style: {
        padding: "2px 4px",
        whiteSpace: "nowrap",
      },
    },
  };

  const filteredData = data.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // const enhancedColumns = useMemo(() => {
  //   if (!enableActions) return columns;

  //   return [
  //     ...columns.map(col => ({ ...col, wrap: false, minWidth: '60px' })), // make columns compact
  //     {
  //       name: "Actions",
  //       cell: (row) => (
  //         <Menu as="div" className="relative inline-block text-left z-50">
  //           <Menu.Button className="p-1 rounded hover:bg-sky-100">
  //             <EllipsisVerticalIcon className="w-4 h-4 text-sky-600" />
  //           </Menu.Button>

  //           <Transition
  //             as={Fragment}
  //             enter="transition ease-out duration-100"
  //             enterFrom="transform opacity-0 scale-95"
  //             enterTo="transform opacity-100 scale-100"
  //             leave="transition ease-in duration-75"
  //             leaveFrom="transform opacity-100 scale-100"
  //             leaveTo="transform opacity-0 scale-95"
  //           >
  //             <Menu.Items className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded shadow-lg focus:outline-none z-[999]">
  //               <Menu.Item>
  //                 {({ active }) => (
  //                   <button
  //                     onClick={() => onView(row)}
  //                     className={`${active ? "bg-sky-50" : ""} block w-full text-left px-2 py-1 text-xs text-sky-700`}
  //                   >
  //                     View
  //                   </button>
  //                 )}
  //               </Menu.Item>
  //               <Menu.Item>
  //                 {({ active }) => (
  //                   <button
  //                     onClick={() => onEdit(row)}
  //                     className={`${active ? "bg-sky-50" : ""} block w-full text-left px-2 py-1 text-xs text-yellow-600`}
  //                   >
  //                     Edit
  //                   </button>
  //                 )}
  //               </Menu.Item>
  //               <Menu.Item>
  //                 {({ active }) => (
  //                   <button
  //                     onClick={() => onDelete(row)}
  //                     className={`${active ? "bg-sky-50" : ""} block w-full text-left px-2 py-1 text-xs text-red-600`}
  //                   >
  //                     Delete
  //                   </button>
  //                 )}
  //               </Menu.Item>
  //             </Menu.Items>
  //           </Transition>
  //         </Menu>
  //       ),
  //       width: "60px",
  //       center: true,
  //     },
  //   ];
  // }, [columns, enableActions, onEdit, onDelete, onView]);
  const enhancedColumns = useMemo(() => {
    if (!enableActions) return columns;

    return [
      ...columns.map(col => ({ ...col, wrap: false, minWidth: '60px' })),
      {
        name: "Actions",
        cell: (row) => (
          <div className="relative z-50"> {/* Make row wrapper relative with high z-index */}
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
                <Menu.Items className="absolute right-0 top-full mt-1 w-28 bg-white border border-gray-200 rounded shadow-lg focus:outline-none z-[9999]">
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
          </div>
        ),
        width: "60px",
        center: true,
        ignoreRowClick: true, // Prevent menu click from triggering row click
      },
    ];
  }, [columns, enableActions, onEdit, onDelete, onView]);

  return (
    <div className="bg-white shadow-md rounded-xl p-2 border border-gray-100 relative">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-1 gap-1">
        <h2 className="text-sm font-semibold text-sky-700">{title}</h2>

        <div className="flex items-center gap-1 w-full sm:w-auto flex-wrap">
          {filters.length > 0 && (
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="inline-flex items-center gap-1 bg-sky-600 text-white px-2 py-1 rounded hover:bg-sky-700 text-xs">
                <FunnelIcon className="w-4 h-4" />
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
                <Menu.Items className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded shadow-lg focus:outline-none z-10">
                  {filters.map((filter, idx) => (
                    <Menu.Item key={idx}>
                      {({ active }) => (
                        <button
                          onClick={() => onFilterChange(filter.value)}
                          className={`${active ? "bg-sky-100" : ""} block w-full text-left px-2 py-1 text-xs text-gray-700`}
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
              className="inline-flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-xs"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export
            </button>
          )}

          <div className="relative flex-1 sm:w-36">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-1 top-1.5" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-6 pr-1 py-1 w-full border rounded focus:ring-1 focus:ring-sky-400 focus:outline-none text-xs"
            />
          </div>
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
        responsive
        dense
      />
    </div>
  );
};

export default CommonList;
