import React from "react";
import DataTable from "react-data-table-component";
import { 
  PencilSquareIcon, 
  TrashIcon, 
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

const CommonList = ({ 
  columns, 
  data, 
  isLoading, 
  totalRows, 
  onEdit, 
  onDelete, 
  onView 
}) => {

  
  const customStyles = {
    table: {
      style: {
        backgroundColor: 'transparent',
      },
    },
    header: {
      style: {
        display: 'none',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f8fafc',
        borderTopLeftRadius: '1rem',
        borderTopRightRadius: '1rem',
        borderBottom: '1px solid #e2e8f0',
        minHeight: '56px',
      },
    },
    headCells: {
      style: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      },
    },
    cells: {
      style: {
        fontSize: '14px',
        color: '#334155',
        paddingTop: '16px',
        paddingBottom: '16px',
      },
    },
    rows: {
      style: {
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#f1f7ff',
          cursor: 'pointer',
        },
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #f1f5f9',
        borderBottomLeftRadius: '1rem',
        borderBottomRightRadius: '1rem',
        padding: '12px',
      },
    },
  };

  
  const enhancedColumns = [
    ...columns,
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {onView && (
            <button onClick={() => onView(row)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors">
              <EyeIcon className="w-5 h-5" />
            </button>
          )}
          {onEdit && (
            <button onClick={() => onEdit(row)} className="p-2 text-amber-500 hover:bg-amber-100 rounded-lg transition-colors">
              <PencilSquareIcon className="w-5 h-5" />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(row)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '120px'
    },
  ];

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-gray-100 overflow-hidden">
      <DataTable
        columns={enhancedColumns}
        data={data}
        progressPending={isLoading}
        pagination
        paginationTotalRows={totalRows}
        highlightOnHover
        customStyles={customStyles}
        responsive
        noHeader
        
        paginationIconNext={<ChevronRightIcon className="w-4 h-4" />}
        paginationIconPrevious={<ChevronLeftIcon className="w-4 h-4" />}
      />
    </div>
  );
};

export default CommonList;