const ALL_OPTION = { value: "all", label: "All" };

/**
 * Replace category select options from API view (exact labels from data).
 */
export function mergeCategoryFilterOptions(bundleFilters, view) {
  const names = view?.categoryOptions;
  if (!names?.length) return bundleFilters;
  const options = [ALL_OPTION, ...names.map((name) => ({ value: name, label: name }))];
  return bundleFilters.map((field) =>
    field.id === "category" ? { ...field, options } : field,
  );
}
