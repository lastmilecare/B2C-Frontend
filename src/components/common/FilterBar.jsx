import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

const FilterBar = ({
  filtersConfig = [],
  tempFilters,
  onChange,
  onApply,
  onReset,
  onExport,
  suggestions,
  uhidSearch,
  onSelectSuggestion,
}) => {
  const today = new Date().toISOString().split("T")[0];

  const handleApply = () => {
    const startDate = tempFilters.startDate;
    const endDate = tempFilters.endDate;

    if (endDate && endDate > today) {
      alert("End date cannot be greater than today.");
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      alert("Start date cannot be after end date.");
      return;
    }
    onApply();
  };

  return (
    <div className="w-full bg-sky-50 p-3 rounded-lg border border-sky-100 mb-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {filtersConfig.map((filter) => (
          <div key={filter.name}>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              {filter.label}
            </label>
            {filter.type === "text" && (
              <div className="relative">
                <input
                  type="text"
                  name={filter.name}
                  value={tempFilters[filter.name] || ""}
                  onChange={onChange}
                  autoComplete="none"
                  placeholder={filter.placeholder || `Enter ${filter.label}`}
                  className={`w-full border px-2 py-1 rounded text-xs focus:ring-1 focus:ring-sky-400 focus:bg-white outline-none shadow-none ${filter.name === "external_id" ? "uppercase" : ""
                    }`}
                />

                {/* ✅ Generic Suggestion Dropdown */}
                {filter.suggestionConfig &&
                  (
                    (
                      filter.name === "external_id"
                        ? uhidSearch
                        : tempFilters[filter.name]
                    ) || ""
                  ).length >= filter.suggestionConfig.minLength &&
                  suggestions?.length > 0 && (
                    <ul className="absolute z-[1000] bg-white border border-gray-200 rounded-md shadow-lg w-full max-h-60 overflow-auto mt-1">
                      {suggestions.map((item) => {
                        const { keyField, valueField, secondaryField } =
                          filter.suggestionConfig;

                        return (
                          <li
                            key={item[keyField]}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              onSelectSuggestion(item[valueField]);
                            }}
                            className="px-4 py-2.5 hover:bg-sky-50 cursor-pointer border-b border-gray-50 last:border-0 transition-all"
                          >
                            <span className="text-gray-700">
                              {item[valueField]}
                            </span>

                            {secondaryField && (
                              <span className="ml-2 text-gray-500">
                                {item[secondaryField]}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
              </div>
            )}

            {filter.type === "select" && (
              <select
                name={filter.name}
                value={tempFilters[filter.name] || ""}
                onChange={onChange}
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
                onChange={onChange}
                max={
                  filter.name === "endDate"
                    ? today
                    : tempFilters.endDate || today
                }
                className="w-full border px-2 py-1 rounded text-xs focus:ring-1 focus:ring-sky-400"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-end gap-2 mt-3 border-t border-sky-100 pt-2">
        <button
          onClick={onReset}
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
        {onExport && (
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
  );
};

export default FilterBar;
