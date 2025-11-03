import React from "react";
import DataTable from "react-data-table-component";

const Table = ({ columns, data, title }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <DataTable
        title={title}
        columns={columns}
        data={data}
        pagination
        highlightOnHover
        dense
      />
    </div>
  );
};

export default Table;
