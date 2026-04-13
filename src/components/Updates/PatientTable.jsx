import React from "react";
import CommonList from "../CommonList";

const PatientTable = ({
 data,
 columns,
 title={title},
 totalRows,
 currentPage,
 perPage,
 onPageChange,
 onPerPageChange,
 isLoading,

 enableActions=true,
 actionButtons=["edit","delete"],

 onEdit,
 onDelete,
 onPrint,
 onPrintCS
}) => {

 return (

  <div className="bg-white rounded-xl shadow border border-gray-100 p-4">

   <CommonList
    title={title}
    columns={columns}
    data={data}
    totalRows={totalRows}
    currentPage={currentPage}
    perPage={perPage}
    onPageChange={onPageChange}
    onPerPageChange={onPerPageChange}
    isLoading={isLoading}

    enableActions={enableActions}
    actionButtons={actionButtons}

    onEdit={onEdit}
    onDelete={onDelete}
    onPrint={onPrint}
    onPrintCS={onPrintCS}
   />

  </div>

 );

};

export default PatientTable;