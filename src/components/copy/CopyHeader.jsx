import React from "react";
import { motion } from "framer-motion";
import { cookie } from "../../utils/cookie";

import {
BellIcon,
MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

const CopyHeader = () => {

const username = cookie.get("username") || "User"

const today = new Date().toLocaleDateString()

return (

<motion.div
initial={{y:-20,opacity:0}}
animate={{y:0,opacity:1}}
transition={{duration:0.4}}
className="bg-gradient-to-r from-sky-100 via-white to-sky-50 border-b border-sky-100 px-6 py-4 flex justify-between items-center shadow-sm"
>



<div>

<h1 className="text-xl font-bold text-sky-700">
LMC Portal
</h1>

<p className="text-xs text-gray-500">
Healthcare Management Dashboard
</p>

</div>



{/* 
<div className="hidden md:flex items-center bg-white shadow-sm border rounded-xl px-3 py-2 w-80">

<MagnifyingGlassIcon className="w-5 text-gray-400"/>

<input
type="text"
placeholder="Search patients, medicines..."
className="outline-none text-sm px-2 w-full"
/>

</div> */}




<div className="flex items-center gap-5">



<div className="text-right hidden md:block">

<p className="text-xs text-gray-400">
Today
</p>

<p className="text-sm font-semibold text-gray-600">
{today}
</p>

</div>




<div className="relative cursor-pointer">

<BellIcon className="w-6 text-gray-600 hover:text-sky-600"/>

<div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></div>

</div>




<div className="flex items-center gap-3 cursor-pointer">

<motion.div
whileHover={{scale:1.1}}
className="w-9 h-9 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white flex items-center justify-center font-semibold shadow"
>

{username.charAt(0).toUpperCase()}

</motion.div>

<span className="text-sm text-gray-700 font-medium">
{username}
</span>

</div>

</div>

</motion.div>

)

}

export default CopyHeader