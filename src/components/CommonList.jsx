import React, { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom"; 
import DataTable from "react-data-table-component";
import { EllipsisVerticalIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
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
  onPrint = () => { },
  onPrintCS = () => { },
  isLoading = false,
  filtersConfig = [],
  onFilterApply = () => { },
  actionButtons = [],
}) => {
  const [tempFilters, setTempFilters] = useState({});
  const [openMenuRow, setOpenMenuRow] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({ ...prev, [name]: value }));
  };

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
    setOpenMenuRow(null); // Filter lagne par menu band
  };

  const handleReset = () => {
    setTempFilters({});
    onFilterApply({});
    setOpenMenuRow(null);
  };

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
          name: (
            <span title={col.title || col.name} className="cursor-help">
              {col.name}
            </span>
          ),
          width: col.width || "auto",
          minWidth: col.minWidth || "100px",
          wrap: col.wrap ?? true,
        })),
    [columns]
  );

  const enhancedColumns = useMemo(() => {
    if (!enableActions) return visibleColumns;

    const buttonConfig = {
      view: { label: "View", color: "text-sky-700", handler: onView },
      edit: { label: "Edit", color: "text-yellow-600", handler: onEdit },
      delete: { label: "Delete", color: "text-red-600", handler: onDelete },
      print: { label: "Print", color: "text-green-700", handler: onPrint },
      printCS: { label: "Print CS", color: "text-purple-700", handler: onPrintCS },
    };

    return [
      ...visibleColumns,
      {
        name: "Actions",
        width: "70px",
        center: true,
        ignoreRowClick: true,
        
        cell: (row) => (
          <ActionMenu
            row={row}
            actionButtons={actionButtons}
            buttonConfig={buttonConfig}
            openMenuRow={openMenuRow}
            setOpenMenuRow={setOpenMenuRow}
          />
        ),
      },
    ];
  }, [
    visibleColumns, 
    enableActions, 
    actionButtons, 
    onEdit, onDelete, onView, onPrint, onPrintCS, 
    openMenuRow 
  ]);

  return (
    <div className="bg-white shadow-md rounded-xl p-3 border border-gray-100">
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

const ActionMenu = ({ row, actionButtons, buttonConfig, openMenuRow, setOpenMenuRow }) => {
  const isOpen = openMenuRow === row;
  const [menuStyle, setMenuStyle] = useState({});
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const MENU_WIDTH = 130;
  const MENU_HEIGHT = 160;

  const handleClick = (e) => {
    e.stopPropagation();
    if (isOpen) {
      setOpenMenuRow(null);
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const opensUp = spaceBelow < MENU_HEIGHT;

    let left = rect.right - MENU_WIDTH;
    if (left < 5) left = rect.left;
    if (left + MENU_WIDTH > viewportWidth) left = viewportWidth - MENU_WIDTH - 10;

    setMenuStyle({
      position: "fixed",
      left: `${left}px`,
      top: opensUp ? "auto" : `${rect.bottom + 2}px`,
      bottom: opensUp ? `${viewportHeight - rect.top + 2}px` : "auto",
      maxHeight: "200px",
      overflowY: "auto",
    });
    setOpenMenuRow(row);
  };

  
  useEffect(() => {
    if (!isOpen) return;
    const closeMenu = () => setOpenMenuRow(null);
    const handleOutsideClick = (event) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [isOpen, setOpenMenuRow]);

  const menuContent = (
    <div
      ref={menuRef}
      style={menuStyle}
      className="z-[9999] bg-white border border-gray-200 rounded shadow-lg flex flex-col p-1 min-w-[130px]"
    >
      {actionButtons.map((btnKey) => {
        const btn = buttonConfig[btnKey];
        if (!btn) return null;
        return (
          <button
            key={btnKey}
            onClick={(e) => {
              e.stopPropagation();
              btn.handler(row);
              setOpenMenuRow(null);
            }}
            className={`block w-full text-left px-2 py-1 text-xs hover:bg-sky-50 rounded ${btn.color}`}
          >
            {btn.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={`p-1 rounded hover:bg-sky-100 ${isOpen ? "bg-sky-50" : ""}`}
      >
        <EllipsisVerticalIcon className="w-4 h-4 text-sky-600" />
      </button>
      
      {isOpen && createPortal(menuContent, document.body)}
    </>
  );
};