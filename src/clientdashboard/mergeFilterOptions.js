const ALL_OPTION = { value: "all", label: "All" };

function withOptions(bundleFilters, fieldId, names) {
  if (!names?.length) return bundleFilters;
  const options = [
    ALL_OPTION,
    ...names.map((name) => ({ value: name, label: name })),
  ];
  return bundleFilters.map((field) =>
    field.id === fieldId ? { ...field, options } : field,
  );
}

/** Sync category / feedback dropdowns from API view models. */
export function mergeFilterOptionsFromView(bundleFilters, view) {
  let fields = bundleFilters;
  fields = withOptions(fields, "category", view?.categoryOptions);
  fields = withOptions(fields, "feedback", view?.feedbackOptions);
  return fields;
}

/** @deprecated use mergeFilterOptionsFromView */
export function mergeCategoryFilterOptions(bundleFilters, view) {
  return mergeFilterOptionsFromView(bundleFilters, view);
}
