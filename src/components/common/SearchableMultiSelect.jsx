import React, { useState, useEffect } from "react";
import { healthAlert } from "../../utils/healthSwal";

const SearchableMultiSelect = ({
  label,
  queryHook,
  value = [],
  onChange,
  maxSelection = 5,
  placeholder = "Search...",
  inputAction,
}) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: apiResponse, isFetching } = queryHook(
    { q: debouncedSearch, page: 1, limit: 20 },
    { skip: !debouncedSearch },
  );

  const results = apiResponse?.data || [];

  useEffect(() => {
    if (debouncedSearch) {
    }
  }, [apiResponse]);

  const handleSelect = (item) => {
    if (value.find((v) => v.id === item.id)) return;

    if (value.length >= maxSelection) {
      healthAlert({
        title: "Diseases",
        text: `You can select up to ${maxSelection} diseases only.`,
        icon: "info",
      });
      return;
    }

    onChange([...value, item]);
    setSearch("");
  };

  const handleRemove = (id) => {
    onChange(value.filter((v) => v.id !== id));
  };
  const handleManualAdd = () => {
  const trimmed = search.trim();

  if (!trimmed) return;

  const alreadyExists = value.find(
    (v) => v.name.toLowerCase() === trimmed.toLowerCase()
  );

  if (alreadyExists) {
    setSearch("");
    return;
  }

  if (value.length >= maxSelection) {
    healthAlert({
      title: "Diseases",
      text: `You can select up to ${maxSelection} diseases only.`,
      icon: "info",
    });
    return;
  }

  const customItem = {
    id: Date.now(),
    name: trimmed,
    isManual: true,
  };

  onChange([...value, customItem]);

  setSearch("");
};

  return (
    <div className="mb-3 relative">
      <label className="text-sm text-gray-600 block mb-1">{label}</label>

      {/* <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none"
      />
      {inputAction}
      {debouncedSearch && (
        <ul className="absolute z-10 border border-gray-200 rounded-lg mt-1 bg-white shadow-sm max-h-40 overflow-y-auto w-full">
          {isFetching ? (
            <li className="px-3 py-2 text-gray-500 text-sm">Loading...</li>
          ) : results.length > 0 ? (
            results.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelect(item)}
                className="px-3 py-2 text-sm hover:bg-sky-50 cursor-pointer"
              >
                {item.name}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500 text-sm">
              No results found
            </li>
          )}
      /> */}
    <input
  type="text"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleManualAdd();
    }
  }}
  placeholder={placeholder}
  className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none"
/>

      {debouncedSearch && (
        <ul className="absolute z-10 border border-gray-200 rounded-lg mt-1 bg-white shadow-sm max-h-40 overflow-y-auto w-full">
          {isFetching ? (
  <li className="px-3 py-2 text-gray-500 text-sm">Loading...</li>
) : results.length > 0 ? (
  <>
    {results.map((item) => (
      <li
        key={item.id}
        onClick={() => handleSelect(item)}
        className="px-3 py-2 text-sm hover:bg-sky-50 cursor-pointer"
      >
        {item.name}
      </li>
    ))}

    {search.trim() && (
      <li
        onClick={handleManualAdd}
        className="px-3 py-2 text-sky-600 text-sm hover:bg-sky-50 cursor-pointer border-t"
      >
        Add "{search}" manually
      </li>
    )}
  </>
) : (
  <>
    <li className="px-3 py-2 text-gray-500 text-sm">
      No results found
    </li>

    <li
      onClick={handleManualAdd}
      className="px-3 py-2 text-sky-600 text-sm hover:bg-sky-50 cursor-pointer font-medium border-t"
    >
      Add "{search}" manually
    </li>
  </>
)}
        </ul>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        {value &&
          value?.map((item) => (
            <span
              key={item.id}
              className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs flex items-center gap-1"
            >
              {item.name}
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className=" cursor-pointer text-red-500 font-bold"
              >
                ×
              </button>
            </span>
          ))}
      </div>
    </div>
  );
};

export default SearchableMultiSelect;

