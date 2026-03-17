import { useState } from "react"
import { useNavigate } from "react-router-dom"

const ModuleCard = ({title,modules,icon}) => {

 const [hover,setHover]=useState(false)
 const navigate=useNavigate()

 return(

  <div
   onMouseEnter={()=>setHover(true)}
   onMouseLeave={()=>setHover(false)}
   className="relative min-w-[220px] bg-white shadow rounded-xl p-5
   hover:shadow-lg transition cursor-pointer"
  >

   <div className="flex items-center gap-3">

    <div className="text-blue-600">
     {icon}
    </div>

    <h3 className="font-semibold">
     {title}
    </h3>

   </div>

   {hover && (

    <div className="absolute left-0 top-16 w-full bg-white shadow-lg
    rounded-lg p-3 space-y-2 z-50">

     {modules.map((m)=>(
      <div
       key={m.name}
       onClick={()=>navigate(m.path)}
       className="text-sm hover:text-blue-600 cursor-pointer"
      >
       {m.name}
      </div>
     ))}

    </div>

   )}

  </div>

 )

}

export default ModuleCard