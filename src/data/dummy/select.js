import { monthOverlaps, reconcile, sum, yearOverlaps } from "./allocate";

const GENDER_LABEL = { male: "Male", female: "Female", other: "Other" };

function clip(series, range) {
  return series.filter((point) => monthOverlaps(point.iso, range));
}

function isFull(series, range) {
  return clip(series, range).length === series.length;
}

export function selectRevenue(source, filters) {
  const months = clip(source.months, filters.dateRange);
  if (!months.length) return { panel: "revenue", empty: true };

  const serviceName = filters.service;
  const selected = serviceName === "all"
    ? source.services
    : source.services.filter((service) => service.name === serviceName);
  const selectedTotal = sum(selected.map((service) => service.value));
  const grand = sum(source.services.map((service) => service.value));
  const share = grand ? selectedTotal / grand : 0;
  const full = isFull(source.months, filters.dateRange) && serviceName === "all";

  let trend;
  let slices;
  let total;
  if (full) {
    trend = source.months.map((point) => ({ date: point.label, value: point.value }));
    slices = source.services.filter((service) => service.value > 0);
    total = source.total;
  } else {
    const target = Math.round(sum(months.map((point) => point.value)) * share);
    trend = months.map((point) => ({
      date: point.label,
      value: Math.round(point.value * share),
    }));
    if (trend.length) {
      const drift = target - sum(trend.map((point) => point.value));
      trend[trend.length - 1].value += drift;
    }
    total = sum(trend.map((point) => point.value));
    slices = serviceName === "all"
      ? reconcile(
          source.services
            .filter((service) => service.value > 0)
            .map((service) => ({ name: service.name, value: Math.round(service.value * (total / grand)) })),
          total,
        )
      : [{ name: serviceName, value: total }];
  }

  const table = source.yearly
    .filter((row) => serviceName === "all" || row.serviceCategory === serviceName)
    .map((row) => {
      const next = { ...row };
      ["y2024", "y2025", "y2026"].forEach((key) => {
        const year = Number(key.slice(1));
        if (!yearOverlaps(year, filters.dateRange)) next[key] = 0;
      });
      next.total = next.y2024 + next.y2025 + next.y2026;
      return next;
    });

  return {
    panel: "revenue",
    total,
    slices,
    trend,
    table,
    utilization: filterNamed(source.utilization, filters.service, "service"),
    patientType: source.patientType,
    valueFormat: "currency",
  };
}

export function selectCost(source, filters) {
  const months = clip(source.months, filters.dateRange);
  if (!months.length) return { panel: "cost", empty: true };
  const category = filters.category;
  const selected = category === "all"
    ? source.categories
    : source.categories.filter((item) => item.name === category);
  const grand = sum(source.categories.map((item) => item.value));
  const selectedTotal = sum(selected.map((item) => item.value));
  const share = grand ? selectedTotal / grand : 0;
  const full = isFull(source.months, filters.dateRange) && category === "all";

  let trend;
  let slices;
  let total;
  if (full) {
    trend = source.months.map((point) => ({ date: point.label, value: point.value }));
    slices = source.categories;
    total = source.total;
  } else {
    const target = Math.round(sum(months.map((point) => point.value)) * share);
    trend = months.map((point) => ({ date: point.label, value: Math.round(point.value * share) }));
    if (trend.length) {
      const drift = target - sum(trend.map((point) => point.value));
      trend[trend.length - 1].value += drift;
    }
    total = sum(trend.map((point) => point.value));
    slices = category === "all"
      ? reconcile(
          source.categories.map((item) => ({
            name: item.name,
            value: Math.round(item.value * (grand ? total / grand : 0)),
          })),
          total,
        )
      : [{ name: category, value: total }];
  }

  const ratio = source.total ? total / source.total : 0;
  const salaries = source.salaries && (category === "all" || category === "Salaries")
    ? source.salaries.map((item) => ({
        label: item.label,
        value: Math.round(item.value * (category === "Salaries" ? total / sum(source.salaries.map((row) => row.value)) : ratio)),
      }))
    : null;

  return {
    panel: "cost",
    total,
    slices,
    trend,
    salaries,
    fixedVariable: scaleRows(source.fixedVariable, ratio),
    quarterly: scaleRows(source.quarterly, ratio),
    quarterKeys: source.quarterKeys,
    fixedKeys: source.fixedKeys,
  };
}

export function selectThirdParty(source, filters) {
  const months = clip(source.months, filters.dateRange);
  if (!months.length) return { panel: "third-party", empty: true };
  const category = filters.category;
  const categories = category === "all"
    ? source.categories
    : source.categories.filter((item) => item.name === category);
  const revenueShare = sum(source.categories.map((item) => item.revenue));
  const selectedRevenue = sum(categories.map((item) => item.revenue));
  const share = revenueShare ? selectedRevenue / revenueShare : 0;

  const trend = months.map((point) => ({
    date: point.label,
    revenue: Math.round(point.revenue * share),
    cost: Math.round(point.cost * share),
  }));
  const revenue = sum(trend.map((point) => point.revenue));
  const cost = sum(trend.map((point) => point.cost));
  const profit = revenue - cost;
  const margin = revenue ? (profit / revenue) * 100 : 0;

  return {
    panel: "third-party",
    kpis: [
      { label: "Total Revenue", value: revenue, format: "currency" },
      { label: "Total Cost", value: cost, format: "currency" },
      { label: "Profit", value: profit, format: "currency" },
      { label: "Profit Margin", value: margin, format: "percent" },
    ],
    revenueTrend: trend.map((point) => ({ date: point.date, value: point.revenue })),
    costTrend: trend.map((point) => ({ date: point.date, value: point.cost })),
    table: categories.map((item) => ({
      category: item.name,
      revenue: item.revenue,
      cost: item.cost,
      profit: item.revenue - item.cost,
      margin: item.revenue ? ((item.revenue - item.cost) / item.revenue) * 100 : 0,
    })),
  };
}

export function selectThirdPartyCategory(source, filters) {
  const months = clip(source.categoryMonths, filters.dateRange);
  if (!months.length) return { panel: "third-party-category", empty: true };
  const keys = filters.category === "all"
    ? source.categoryKeys
    : source.categoryKeys.filter((key) => key === filters.category);
  const data = months.map((point) => {
    const row = { label: point.label };
    keys.forEach((key) => {
      row[key] = point[key] || 0;
    });
    return row;
  });
  return {
    panel: "third-party-category",
    data,
    keys,
    margins: source.categories
      .filter((item) => filters.category === "all" || item.name === filters.category)
      .map((item) => ({
        label: item.name,
        value: item.revenue ? ((item.revenue - item.cost) / item.revenue) * 100 : 0,
      })),
  };
}

export function selectPatient(profile, filters, panel = "patients") {
  const genderName = filters.gender && filters.gender !== "all" ? GENDER_LABEL[filters.gender] : null;
  const typeName = filters.patientType && filters.patientType !== "all" ? filters.patientType.toUpperCase() : null;
  const genders = genderName ? [genderName] : Object.keys(profile.byGenderCategory);
  const types = typeName ? [typeName] : ["APL", "BPL"];

  const genderSlices = genders
    .map((gender) => ({
      name: gender,
      value: types.reduce((total, type) => total + (profile.byGenderCategory[gender]?.[type] || 0), 0),
    }))
    .filter((slice) => slice.value > 0);

  const categoryMap = {};
  genders.forEach((gender) => {
    types.forEach((type) => {
      categoryMap[type] = (categoryMap[type] || 0) + (profile.byGenderCategory[gender]?.[type] || 0);
    });
  });
  const categorySlices = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .filter((slice) => slice.value > 0);

  const unique = sum(genderSlices.map((slice) => slice.value));
  if (!unique) return { panel, empty: true };

  const ratio = profile.base / unique ? unique / profile.base : 1;
  const ageSource = genderName && profile.ageByGender[genderName]
    ? profile.ageByGender[genderName]
    : profile.age;
  const age = scaleSlices(ageSource, unique);

  const rows = profile.segmentation.rows.filter((row) => {
    if (row.Sex === "Total") return !genderName && !typeName;
    if (genderName && row.block !== genderName) return false;
    if (typeName && row.kind !== "group" && row.kind !== typeName.toLowerCase()) return false;
    if (typeName && row.kind === "group") return false;
    return true;
  });

  const geoTotal = Math.round(sum(profile.geo.map((row) => row.patients)) * (unique / profile.base));
  const geo = reconcile(
    profile.geo.map((row) => ({ ...row, patients: Math.round(row.patients * (unique / profile.base)) })),
    geoTotal,
    "area",
    "patients",
  );

  const extras = (profile.extras || []).map((item) => ({
    ...item,
    value: item.fixed ? item.value : Math.round(item.value * ratio),
  }));

  return {
    panel,
    kpis: [
      { label: profile.uniqueLabel || "Unique Patients", value: genderName || typeName ? unique : profile.uniqueHeadline },
      ...extras,
      ...(profile.returning
        ? [{ label: "Returning Patients", value: genderName || typeName ? Math.round(profile.returning * (unique / profile.base)) : profile.returning }]
        : []),
      ...(profile.totalPatients
        ? [{ label: "Total Patients", value: genderName || typeName ? unique : profile.totalPatients }]
        : []),
    ],
    gender: genderSlices,
    category: categorySlices,
    age,
    maleAge: !genderName || genderName === "Male" ? scaleSlices(profile.ageByGender.Male || [], genderName ? unique : sum((profile.ageByGender.Male || []).map((item) => item.value))) : [],
    femaleAge: !genderName || genderName === "Female" ? scaleSlices(profile.ageByGender.Female || [], genderName ? unique : sum((profile.ageByGender.Female || []).map((item) => item.value))) : [],
    segmentation: { columns: profile.segmentation.columns, rows },
    geo,
    showGenderAge: true,
  };
}

export function selectFootfall(source, filters) {
  const total = clip(source.total, filters.dateRange);
  const unique = clip(source.unique, filters.dateRange);
  if (!total.length) return { panel: "footfall", empty: true };
  const full = total.length === source.total.length;
  const totalVisits = sum(total.map((point) => point.value));
  const uniqueVisits = sum(unique.map((point) => point.value));
  return {
    panel: "footfall",
    kpis: full
      ? [
          { label: "Total Patients", value: source.headline.totalPatients },
          { label: "Unique Patients", value: source.headline.uniquePatients },
          { label: "Returning Patients", value: source.headline.returningPatients },
        ]
      : [
          { label: "Footfall in selected period", value: totalVisits },
          { label: "Monthly unique visits", value: uniqueVisits, sublabel: "Sum of monthly unique patients" },
        ],
    totalTrend: total.map((point) => ({ date: point.label, value: point.value })),
    uniqueTrend: unique.map((point) => ({ date: point.label, value: point.value })),
  };
}

export function selectDisease(source, filters) {
  const category = filters.diseaseCategory;
  const specialty = filters.specialty;
  let diseases = source.diseases.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (specialty !== "all" && item.specialty !== specialty) return false;
    return true;
  });
  const months = clip(source.trend, filters.dateRange);
  if (!diseases.length || !months.length) return { panel: "disease", empty: true };

  const full = isFull(source.trend, filters.dateRange) && category === "all" && specialty === "all";
  const trendKeys = source.trendKeys.filter((key) => diseases.some((item) => item.name === key) || (category === "all" && specialty === "all"));
  const activeKeys = source.trendKeys.filter((key) => category === "all" && specialty === "all"
    ? true
    : diseases.some((item) => item.name === key));

  const ratio = full ? 1 : months.length / source.trend.length;
  diseases = diseases.map((item) => ({ ...item, visits: Math.round(item.visits * ratio) }));
  const clinical = sum(diseases.map((item) => item.visits));
  const top = [...diseases].sort((a, b) => b.visits - a.visits)[0];
  const specialties = aggregate(diseases, "specialty");

  return {
    panel: "disease",
    kpis: [
      { label: "Patient OPD Visits", value: full ? source.opd : Math.round(source.opd * ratio) },
      { label: "Clinical Cases", value: clinical },
      { label: "Most Common Disease", value: top?.name || "—", format: "text" },
      { label: "Most Common Disease Category", value: top?.category || "—", format: "text" },
      { label: "Most Utilized Specialty", value: specialties[0]?.name || "—", format: "text" },
    ],
    trend: months.map((point) => {
      const row = { date: point.label };
      activeKeys.forEach((key) => {
        row[key] = point[key] || 0;
      });
      return row;
    }),
    trendKeys: activeKeys.length ? activeKeys : trendKeys,
    diseases: diseases.filter((item) => item.name !== "Other diseases").slice(0, 10),
    specialties,
  };
}

export function selectComplaints(source, filters, panel = "complaints") {
  const names = filters.complaint === "all" ? source.names : source.names.filter((name) => name === filters.complaint);
  if (!names.length) return { panel, empty: true };
  const areaBase = sum(source.areas.map((area) => area.patients)) || 1;
  let share = filters.area === "all"
    ? 1
    : (source.areas.find((area) => area.area === filters.area)?.patients || 0) / areaBase;
  if (filters.gender && filters.gender !== "all" && source.gender) {
    const genderTotal = sum(source.gender.map((item) => item.value)) || 1;
    const match = source.gender.find((item) => item.name.toLowerCase() === filters.gender);
    share *= (match?.value || 0) / genderTotal;
  }

  const complaints = source.complaints
    .filter((item) => names.includes(item.label))
    .map((item) => ({ ...item, value: Math.max(0, Math.round(item.value * share)) }));
  const byAge = source.byAge.map((row) => {
    const next = { label: row.label };
    names.forEach((name) => {
      next[name] = Math.max(0, Math.round((row[name] || 0) * share));
    });
    return next;
  });
  const areas = filters.area === "all" ? source.areas : source.areas.filter((area) => area.area === filters.area);
  const revenueByComplaint = source.revenueByComplaint
    ?.filter((item) => filters.complaint === "all" || item.label === filters.complaint)
    .map((item) => ({ ...item, value: Math.round(item.value * share) }));

  const kpis = [{ label: "Complaint records", value: sum(complaints.map((item) => item.value)) }];
  if (source.totalPatients != null) {
    kpis.unshift({
      label: "Total Patients",
      value: Math.round(source.totalPatients * share),
    });
  }
  if (revenueByComplaint) {
    kpis.push({
      label: "Revenue",
      value: sum(revenueByComplaint.map((item) => item.value)),
      format: "currency",
    });
  }

  return {
    panel,
    kpis,
    complaints,
    byAge,
    names,
    areas,
    gender: source.gender?.filter((item) => !filters.gender || filters.gender === "all" || item.name.toLowerCase() === filters.gender),
    revenueByComplaint,
  };
}

export function selectFeedback(source, filters) {
  const slices = filters.feedback === "all"
    ? source.slices
    : source.slices.filter((item) => item.name === filters.feedback);
  if (!slices.length) return { panel: "feedback", empty: true };
  const total = sum(slices.map((item) => item.value));
  return {
    panel: "feedback",
    kpis: [
      { label: "Total Patients", value: filters.feedback === "all" ? source.totalPatients : total },
      {
        label: "Patients Responded (%)",
        value: filters.feedback === "all" ? source.respondedPct : 100,
        format: "percent",
      },
    ],
    slices,
  };
}

function filterNamed(rows, selected, key) {
  if (!rows || selected === "all") return rows || null;
  return rows.filter((row) => row[key] === selected);
}

function scaleSlices(slices, targetTotal) {
  const current = sum(slices.map((slice) => slice.value));
  if (!current) return [];
  const next = slices.map((slice) => ({
    ...slice,
    value: Math.round((slice.value / current) * targetTotal),
  }));
  return reconcile(next, targetTotal);
}

function scaleRows(rows, ratio) {
  if (!rows) return null;
  return rows.map((row) => {
    const next = { ...row };
    Object.keys(next).forEach((key) => {
      if (key !== "label" && typeof next[key] === "number") next[key] = Math.round(next[key] * ratio);
    });
    return next;
  });
}

function aggregate(rows, key) {
  const map = new Map();
  rows.forEach((row) => {
    map.set(row[key], (map.get(row[key]) || 0) + row.visits);
  });
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
