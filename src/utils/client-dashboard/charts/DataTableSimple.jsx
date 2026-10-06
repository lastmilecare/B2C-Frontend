import DataTable from "react-data-table-component";

const customStyles = {
  headCells: {
    style: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#334155",
      backgroundColor: "#f8fafc",
    },
  },
  cells: {
    style: {
      fontSize: "13px",
      color: "#475569",
    },
  },
  rows: {
    style: {
      minHeight: "44px",
    },
  },
};

export function DataTableSimple({ columns, data, title }) {
  return (
    <DataTable
      title={title}
      columns={columns}
      data={data}
      customStyles={customStyles}
      pagination={data.length > 10}
      paginationPerPage={10}
      highlightOnHover
      dense
    />
  );
}
