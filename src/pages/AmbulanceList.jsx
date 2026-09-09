import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CopyFilterBar from '../components/Updates/Filter';
import PatientTable from '../components/Updates/PatientTable';
import Avatar from '../components/common/Avatar';
import useDebounce from '../hooks/useDebounce';
import {
  useDeleteAmbulanceMutation,
  useGetAmbulancesQuery,
  useSearchAmbulanceQuery,
} from '../redux/apiSlice';
import { healthAlert } from '../utils/healthSwal';
import { formatDate, formatTime } from '../utils/helper';

const AmbulanceList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 500);

  const [tempFilters, setTempFilters] = useState({
    company_name: '',
    ambulance_type: '',
    fuel_type: '',
    number_plate: '',
    driver_name: '',
    unique_name: '',
    startDate: '',
    endDate: '',
  });
  const [filters, setFilters] = useState({});

  const { data: suggestions = [] } = useSearchAmbulanceQuery(debouncedSearch, {
    skip: debouncedSearch.length < 2,
  });

  const { data, isLoading } = useGetAmbulancesQuery({ page, limit, ...filters });
  const [deleteAmbulance] = useDeleteAmbulanceMutation();

  const ambulances = data?.data || [];
  const pagination = data?.pagination || {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'unique_name') {
      finalValue = value.toUpperCase();
      setSearchValue(finalValue);
    }

    setTempFilters((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSelectSuggestion = (val) => {
    setTempFilters((prev) => ({ ...prev, unique_name: val }));
    setSearchValue('');
  };

  const handleApplyFilters = () => {
    const today = new Date().toISOString().split('T')[0];
    const { startDate, endDate } = tempFilters;

    if (endDate && endDate > today) {
      healthAlert({
        title: 'Invalid Date',
        text: 'End date cannot be greater than today',
        icon: 'info',
      });
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      healthAlert({
        title: 'Date Range Error',
        text: 'Start date cannot be after end date',
        icon: 'info',
      });
      return;
    }

    setFilters(tempFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setTempFilters({
      company_name: '',
      ambulance_type: '',
      fuel_type: '',
      number_plate: '',
      driver_name: '',
      unique_name: '',
      startDate: '',
      endDate: '',
    });
    setFilters({});
    setPage(1);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete ambulance ${row.unique_name}?`)) return;

    try {
      await deleteAmbulance(row.id).unwrap();
      healthAlert({
        title: 'Success',
        text: 'Ambulance deleted successfully',
        icon: 'success',
      });
    } catch (err) {
      healthAlert({
        title: 'Error',
        text: err?.data?.message || 'Delete failed',
        icon: 'error',
      });
    }
  };

  const filtersConfig = [
    {
      label: 'Unique ID',
      name: 'unique_name',
      type: 'text',
      suggestionConfig: {
        minLength: 2,
        valueField: 'unique_name',
        secondaryField: 'company_name',
      },
    },
    { label: 'Company Name', name: 'company_name', type: 'text' },
    {
      label: 'Ambulance Type',
      name: 'ambulance_type',
      type: 'select',
      options: [
        { label: 'Basic', value: 'basic' },
        { label: 'Advanced', value: 'advanced' },
        { label: 'ICU', value: 'icu' },
        { label: 'Neonatal', value: 'neonatal' },
        { label: 'Patient Transport', value: 'patient_transport' },
      ],
    },
    {
      label: 'Fuel Type',
      name: 'fuel_type',
      type: 'select',
      options: [
        { label: 'Petrol', value: 'petrol' },
        { label: 'Diesel', value: 'diesel' },
        { label: 'CNG', value: 'cng' },
        { label: 'Electric', value: 'electric' },
      ],
    },
    { label: 'Number Plate', name: 'number_plate', type: 'text' },
    { label: 'Driver Name', name: 'driver_name', type: 'text' },
    { label: 'Date from', name: 'startDate', type: 'date' },
    { label: 'Date to', name: 'endDate', type: 'date' },
  ];

  const columns = [
    {
      name: 'Ambulance',
      width: '280px',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.company_name} />
          <div className="leading-tight">
            <p className="font-semibold text-gray-800">{row.company_name}</p>
            <p className="text-xs text-gray-500">ID: {row.unique_name}</p>
          </div>
        </div>
      ),
    },
    {
      name: 'Type',
      cell: (row) => (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium capitalize">
          {row.ambulance_type?.replace('_', ' ')}
        </span>
      ),
    },
    {
      name: 'Plate',
      selector: (row) => row.number_plate,
    },
    {
      name: 'Driver',
      cell: (row) => (
        <div className="text-xs">
          <p className="font-medium">{row.driver_name}</p>
          <p className="text-slate-500">{row.driver_mobile || row.driver_number}</p>
        </div>
      ),
    },
    {
      name: 'Fuel',
      cell: (row) => (
        <span className="capitalize text-xs bg-gray-100 px-2 py-1 rounded">
          {row.fuel_type}
        </span>
      ),
    },
    {
      name: 'Monthly Range',
      cell: (row) => (
        <span className="text-xs">
          {row.per_month_range ? `${row.per_month_range} km` : 'N/A'}
        </span>
      ),
    },
    {
      name: 'Status',
      cell: (row) => {
        const status = row.status || 'available';
        const colors = {
          available: 'bg-green-100 text-green-700',
          on_trip: 'bg-amber-100 text-amber-700',
          maintenance: 'bg-orange-100 text-orange-700',
          inactive: 'bg-gray-100 text-gray-600',
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${colors[status] || colors.inactive}`}
          >
            {status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      name: 'Added On',
      cell: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-slate-700">{formatDate(row.createdAt)}</span>
          <span className="text-slate-400">{formatTime(row.createdAt)}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">Ambulance Registry</h1>

      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        suggestions={suggestions}
        searchValue={searchValue}
        onSelectSuggestion={handleSelectSuggestion}
      />

      <PatientTable
        title="Ambulance List"
        data={ambulances}
        columns={columns}
        totalRows={pagination.totalRecords || 0}
        currentPage={pagination.currentPage || page}
        perPage={limit}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        isLoading={isLoading}
        onEdit={(row) => navigate(`/ambulances/${row.id}`)}
        onDelete={handleDelete}
        enableAdd
        addButtonText="Add Ambulance"
        onAdd={() => navigate('/ambulance')}
      />
    </div>
  );
};

export default AmbulanceList;
