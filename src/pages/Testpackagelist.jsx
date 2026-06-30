import React, { useState, useEffect } from "react";
import {
  BeakerIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
// import {
//   getStoredPackages,
//   PACKAGES_STORAGE_KEY,
//   PACKAGE_LEVELS,
// } from "./TestPackageForm";
import { getStoredPackages,
    PACKAGES_STORAGE_KEY,
    PACKAGE_LEVELS
 } from "../utils/constants";
import { healthAlert } from "../utils/healthSwal";
import CopyFilterBar from "../components/Updates/Filter";
const LEVEL_STYLES = {
  BASIC: "bg-green-100 text-green-700 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  ADVANCED: "bg-purple-100 text-purple-700 border-purple-200",
};

const TestPackageList = ({ onEdit }) => {
  const [packages, setPackages] = useState([]);
//   const [search, setSearch] = useState("");
//   const [levelFilter, setLevelFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [tempFilters, setTempFilters] = useState({
  workerName: "",
  packageName: "",
  status: "",
  fromDate: "",
  toDate: "",
});

const [filters, setFilters] = useState({});

  const loadPackages = () => {
    setPackages(getStoredPackages());
  };

  useEffect(() => {
    loadPackages();

    // Listen for storage changes (when form saves)
    const handleStorage = () => loadPackages();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
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
    workerName: "",
    packageName: "",
    status: "",
    fromDate: "",
    toDate: "",
  };

  setTempFilters(reset);
  setFilters({});
};
const filtersConfig = [
  {
    label: "Worker Name",
    name: "workerName",
    type: "text",
  },
  {
    label: "Package Name",
    name: "packageName",
    type: "text",
  },
  {
    label: "Status",
    name: "status",
    type: "select",
    options: [
      {
        value: "",
        label: "All",
      },
      {
        value: "ACTIVE",
        label: "Active",
      },
      {
        value: "INACTIVE",
        label: "Inactive",
      },
    ],
  },
  {
    label: "From Date",
    name: "fromDate",
    type: "date",
  },
  {
    label: "To Date",
    name: "toDate",
    type: "date",
  },
];

  const handleDelete = (id) => {
    healthAlert({
      title: "Delete Package?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = packages.filter((p) => p.id !== id);
        localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(updated));
        setPackages(updated);
        healthAlert({ title: "Deleted", icon: "success", timer: 1500 });
      }
    });
  };

//   const filtered = packages.filter((pkg) => {
//     const matchSearch =
//       pkg.packageName?.toLowerCase().includes(search.toLowerCase()) ||
//       pkg.description?.toLowerCase().includes(search.toLowerCase());
//     const matchLevel = levelFilter ? pkg.level === levelFilter : true;
//     return matchSearch && matchLevel;
//   });
const filtered = packages.filter((pkg) => {
  const createdDate = pkg.createdAt?.split("T")[0];

  return (
    (!filters.workerName ||
      pkg.workerName
        ?.toLowerCase()
        .includes(filters.workerName.toLowerCase())) &&

    (!filters.packageName ||
      pkg.packageName
        ?.toLowerCase()
        .includes(filters.packageName.toLowerCase())) &&

    (!filters.status ||
      pkg.status === filters.status) &&

    (!filters.fromDate ||
      createdDate >= filters.fromDate) &&

    (!filters.toDate ||
      createdDate <= filters.toDate)
  );
});
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Filter bar */}
      {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm
              focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-50"
          />
        </div>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600
            focus:outline-none focus:border-sky-400"
        >
          <option value="">All Levels</option>
          {PACKAGE_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        <span className="text-sm text-gray-500">
          {filtered.length} package{filtered.length !== 1 ? "s" : ""}
        </span>
      </div> */}
      <CopyFilterBar
  filtersConfig={filtersConfig}
  tempFilters={tempFilters}
  onChange={handleChange}
  onApply={handleApplyFilters}
  onReset={handleResetFilters}
/>

      {/* Package cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BeakerIcon className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No packages found</p>
          <p className="text-sm mt-1">
            Create a package using the form tab above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((pkg) => {
            const isExpanded = expandedId === pkg.id;
            const levelStyle =
              LEVEL_STYLES[pkg.level] || "bg-gray-100 text-gray-600";

            return (
              <div
                key={pkg.id}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Card header */}
                <div
                  className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : pkg.id)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-sky-100 p-2 rounded-xl">
                      <BeakerIcon className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {pkg.packageName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {pkg.description || "No description"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border ${levelStyle}`}
                    >
                      {pkg.level}
                    </span>
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {(pkg.bloodTests?.length || 0)} blood •{" "}
                      {(pkg.radiologyTests?.length || 0)} radiology
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(pkg);
                      }}
                      className="p-1.5 rounded-lg hover:bg-sky-50 text-sky-600 transition-colors"
                      title="Edit"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(pkg.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                    <span className="text-gray-300 text-lg">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-6 py-5 space-y-5 bg-slate-50">
                    {/* Blood tests */}
                    <div>
                      <p className="text-[10px] uppercase font-bold text-sky-600 mb-2 tracking-wider">
                        Blood / Lab Tests ({pkg.bloodTests?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.bloodTests?.length > 0 ? (
                          pkg.bloodTests.map((t) => (
                            <span
                              key={t.id}
                              className="bg-sky-100 text-sky-700 border border-sky-200 px-3 py-1 rounded-full text-xs font-medium"
                            >
                              {t.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </div>
                    </div>

                    {/* Radiology tests */}
                    <div>
                      <p className="text-[10px] uppercase font-bold text-emerald-600 mb-2 tracking-wider">
                        Radiology Tests ({pkg.radiologyTests?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.radiologyTests?.length > 0 ? (
                          pkg.radiologyTests.map((t) => (
                            <span
                              key={t.id}
                              className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-medium"
                            >
                              {t.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-400">
                      Created: {new Date(pkg.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TestPackageList;