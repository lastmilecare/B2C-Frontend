import React,{useState} from "react";
import { useGetPatientsQuery, useSearchUHIDQuery } from "../redux/apiSlice";
import PatientTable from "../components/copy/PatientTable";
import CopyFilterBar from "../components/copy/CopyFilterBar";
import useDebounce from "../hooks/useDebounce";
import { healthAlert } from "../utils/healthSwal";
import Avatar from "../components/common/Avatar";
import { useNavigate } from "react-router-dom";

const PatientListCopy = () => {
const navigate = useNavigate();
const [page,setPage]=useState(1)
const [limit,setLimit]=useState(10)

const [uhidSearch,setUhidSearch]=useState("")
const debouncedUhid=useDebounce(uhidSearch,500)

const {data:suggestions=[]}=useSearchUHIDQuery(debouncedUhid,{
 skip:debouncedUhid.length<2
})

const [tempFilters,setTempFilters]=useState({
 name:"",
 contactNumber:"",
 gender:"",
 category:"",
 startDate:"",
 endDate:"",
 external_id:"",
 idProof_number:"",
})

const [filters,setFilters]=useState({})

const {data,isLoading}=useGetPatientsQuery({
 page,
 limit,
 ...filters
})

const patients=data?.data || []
const pagination=data?.pagination || {}

const handleChange=(e)=>{
 const {name,value}=e.target
 let finalValue=value

 if(name==="external_id"){
  finalValue=value.toUpperCase()
  setUhidSearch(finalValue)
 }

 if(name==="contactNumber"){
  finalValue=value.replace(/[^0-9]/g,"").slice(0,10)
 }

 setTempFilters(prev=>({
  ...prev,
  [name]:finalValue
 }))
}

const handleSelectSuggestion=(val)=>{
 setTempFilters(prev=>({...prev,external_id:val}))
 setUhidSearch("")
}

const handleApplyFilters=()=>{

 const today=new Date().toISOString().split("T")[0]
 const {startDate,endDate}=tempFilters

 if(endDate && endDate>today){
  healthAlert({
   title:"Invalid Date",
   text:"End date cannot be greater than today",
   icon:"info"
  })
  return
 }

 if(startDate && endDate && startDate>endDate){
  healthAlert({
   title:"Date Range Error",
   text:"Start date cannot be after end date",
   icon:"info"
  })
  return
 }

 setFilters(tempFilters)
 setPage(1)
}

const handleResetFilters=()=>{
 setTempFilters({
  name:"",
  contactNumber:"",
  gender:"",
  category:"",
  startDate:"",
  endDate:"",
  external_id:"",
  idProof_number:"",
 })
 setFilters({})
 setPage(1)
}

const filtersConfig=[

 {label:"UHID",name:"external_id",type:"text",
  suggestionConfig:{
   minLength:2,
   keyField:"external_id",
   valueField:"external_id",
   secondaryField:"name"
  }
 },

 {label:"Patient Name",name:"name",type:"text"},
 {label:"Mobile",name:"contactNumber",type:"text"},

 {
  label:"Gender",
  name:"gender",
  type:"select",
  options:[
   {label:"Male",value:"male"},
   {label:"Female",value:"female"},
   {label:"Other",value:"other"}
  ]
 },

 {
  label:"Fin Category",
  name:"category",
  type:"select",
  options:[
   {label:"APL",value:"apl"},
   {label:"BPL",value:"bpl"}
  ]
 },

 {label:"Date from",name:"startDate",type:"date"},
 {label:"Date to",name:"endDate",type:"date"},
 {label:"Unique Id",name:"idProof_number",type:"text"}

]

const columns=[

{
 name:"Patient",
 cell:(row)=>(

  <div className="flex items-center gap-3">

   
   <div className="relative">

    <Avatar
     name={row.name}
     gender={row.gender}
     age={row.age}
    />

    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>

   </div>


   <div className="leading-tight">

    <p className="font-semibold text-gray-800">
     {row.name}
    </p>

    <p className="text-xs text-gray-500">
     UHID : {row.external_id}
    </p>

   </div>

  </div>

 )
},

{
 name:"Mobile",
 selector:(row)=>row.contactNumber
},

{
 name:"Gender",
 cell:(row)=>{

  const gender=row.gender?.toLowerCase()

  return(

   <span className={`px-2 py-1 text-xs rounded-full font-medium

   ${gender==="male"
    ?"bg-blue-100 text-blue-700"

    :gender==="female"
    ?"bg-pink-100 text-pink-700"

    :"bg-gray-100 text-gray-600"}

   `}>

    {gender==="male"?"👨 Male":
     gender==="female"?"👩 Female":
     "Other"}

   </span>

  )

 }
},

{
 name:"Age",
 cell:(row)=>(

  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">

   {row.age} yrs

  </span>

 )
},

{
 name:"Category",
 cell:(row)=>{

  const category=row.category || "N/A"

  return(
   <span
    className={`px-2 py-1 rounded-full text-xs font-semibold
     ${category==="APL"
      ?"bg-green-100 text-green-700"
      :category==="BPL"
      ?"bg-orange-100 text-orange-700"
      :"bg-gray-100 text-gray-600"}
    `}
   >
    {category}
   </span>
  )
 }
},

{
 name:"Added On",
 selector:(row)=>new Date(row.createdAt).toISOString().split("T")[0]
}

]

return(

<div className="max-w-7xl mx-auto">

<h1 className="text-2xl font-semibold text-gray-700 mb-6">
Patient List
</h1>

<CopyFilterBar
 filtersConfig={filtersConfig}
 tempFilters={tempFilters}
 onChange={handleChange}
 onApply={handleApplyFilters}
 onReset={handleResetFilters}
 suggestions={suggestions}
 uhidSearch={uhidSearch}
 onSelectSuggestion={handleSelectSuggestion}
/>

<PatientTable
 data={patients}
 columns={columns}
 totalRows={pagination.totalRecords || 0}
 currentPage={pagination.currentPage || page}
 perPage={limit}
 onPageChange={(p)=>setPage(p)}
 onPerPageChange={(l)=>{
  setLimit(l)
  setPage(1)
 }}
 isLoading={isLoading}

 onEdit={(row)=>{
   navigate(`/patient-registration-copy/${row.id}`)
 }}

 onDelete={(row)=>{
   console.log("Delete Patient",row)
 }}
/>

</div>

)

}

export default PatientListCopy