import React, { useState } from "react";
import { ArrowDownTrayIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { healthAlert } from "../../utils/healthSwal";

const CopyFilterBar = ({
  filtersConfig = [],
  tempFilters,
  onChange,
  onApply,
  onReset,
  onExport,
  suggestions,
  uhidSearch,
  onSelectSuggestion,
  onPrint,
  suggestionsMap = {},
}) => {

  const today = new Date().toISOString().split("T")[0];
  const [activeField, setActiveField] = useState(null);

  const handleApply = () => {

    const startDate = tempFilters.startDate;
    const endDate = tempFilters.endDate;

    if (endDate && endDate > today) {
      healthAlert({
        title: "Invalid Date",
        text: "End date cannot be greater than today.",
        icon: "info",
      });
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      healthAlert({
        title: "Date Range Error",
        text: "Start date cannot be after end date.",
        icon: "info",
      });
      return;
    }

    onApply();
  };

  return (

   <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-cyan-50
rounded-xl border border-sky-100 shadow-sm p-4 mb-5">

     
      <div className="flex items-center justify-between mb-4">

        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <MagnifyingGlassIcon className="w-4 h-4 text-sky-600"/>
          Filter Options
        </h3>

      </div>
      <div className="flex items-center justify-between mb-2">



</div>

<div className="h-[2px] w-16 bg-gradient-to-r from-sky-500 to-cyan-400 rounded mb-4"></div>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">

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
                  autoComplete="off"
                  onFocus={() => setActiveField(filter.name)}
                  placeholder={filter.placeholder || `Enter ${filter.label}`}
                  className={`w-full border border-gray-300 px-3 py-2 rounded-md text-xs
focus:ring-2 focus:ring-sky-400 focus:border-sky-400
bg-white shadow-sm transition
${filter.name === "external_id" ? "uppercase" : ""}`}
                />

                
                {filter.suggestionConfig &&
                  activeField === filter.name &&
                  tempFilters[filter.name]?.length >=
                    filter.suggestionConfig.minLength &&
                  (() => {

                    const fieldSuggestions =
                      suggestionsMap?.[filter.name] ?? suggestions ?? [];

                    if (!fieldSuggestions.length) return null;

                    return (

                      <ul className="absolute z-[1000] bg-white border border-gray-300 bg-white shadow-sm rounded-md shadow-lg w-full max-h-60 overflow-auto mt-1">

                        {fieldSuggestions.map((item) => {

                          const {
                            keyField,
                            valueField,
                            secondaryField
                          } = filter.suggestionConfig;

                          return (

                            <li
                              key={item[keyField]}

                              onMouseDown={(e) => {

                                e.preventDefault();

                                if (suggestionsMap?.[filter.name]) {

                                  onSelectSuggestion(
                                    filter.name,
                                    item[valueField]
                                  );

                                } else {

                                  onSelectSuggestion(
                                    item[valueField]
                                  );

                                }

                                setActiveField(null);

                              }}

                              className="px-3 py-2 text-xs hover:bg-sky-50 cursor-pointer border-b border-gray-50 last:border-0"
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

                    );

                  })()}

              </div>

            )}

            
            {filter.type === "select" && (

              <select
                name={filter.name}
                value={tempFilters[filter.name] || ""}
                onChange={onChange}
                className="w-full border border-gray-300 bg-white shadow-sm border-gray-200 px-3 py-2 rounded-md text-xs
                focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
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
                className="w-full border border-gray-300 bg-white shadow-sm px-3 py-2 rounded-md text-xs
                focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />

            )}

          </div>

        ))}

      </div>

      
      <div className="flex flex-wrap justify-end gap-2 mt-4 pt-3 border-t border-gray-100">

        {onReset && (

          <button
            onClick={onReset}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-xs hover:bg-gray-200 transition"
          >
            Reset
          </button>

        )}

        {onApply && (

          <button
            onClick={handleApply}
            className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-md text-xs hover:shadow-md transition"
          >
            Apply 
          </button>

        )}

        {onExport && (

          <button
            onClick={onExport}
            className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-xs"
          >

            <ArrowDownTrayIcon className="w-4 h-4" />
            Export

          </button>

        )}

        {onPrint && (

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1 bg-slate-600 text-white px-3 py-2 rounded-md hover:bg-slate-700 text-xs"
          >

            Print

          </button>

        )}

      </div>

    </div>

  );

};

export default CopyFilterBar;