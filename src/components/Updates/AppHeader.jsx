import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { cookie } from "../../utils/cookie";
import { 
  Bars3Icon, 
  ArrowLeftStartOnRectangleIcon 
} from "@heroicons/react/24/outline";

const AppHeader = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const username = cookie.get("username") || "User";
  const today = new Date().toLocaleDateString();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const letterAnimation = {
    animate: { 
      y: [0, -2, 0], 
      color: ["#047857", "#10b981", "#047857"], 
    },
  };

  const ekgPath = "M0,10 L5,10 L8,3 L12,17 L15,10 L25,10";

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-sky-100 px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 z-30"
    >
      <div className="flex items-center gap-4">
        {/* Light Green Hamburger Menu Icon */}
        <button 
          onClick={toggleSidebar}
          className="p-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors group"
        >
          <Bars3Icon className="w-6 text-emerald-600 group-hover:scale-110 transition-transform" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-[1.5px] relative">
            {"LMC Portal".split("").map((char, index) => (
              <motion.span
                key={index}
                variants={letterAnimation}
                animate="animate"
                transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.1, ease: "easeInOut" }}
                className="text-xl font-extrabold inline-block tracking-tight text-emerald-700"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
            
            <div className="w-10 h-6 flex items-center justify-center overflow-hidden ml-1">
              <svg viewBox="0 0 25 20" className="w-full h-full">
                <path d={ekgPath} fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
                <motion.path
                  d={ekgPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </svg>
            </div>
          </div>
          <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">Healthcare Management</p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="text-right hidden md:block">
          <p className="text-[10px] text-neutral-400 uppercase">Today</p>
          <p className="text-sm font-bold text-neutral-700">{today}</p>
        </div>

        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all text-xs font-bold shadow-sm"
        >
          <ArrowLeftStartOnRectangleIcon className="w-4" />
          Logout
        </motion.button>

        <div className="flex items-center gap-3 pl-3 border-l border-sky-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-md border-2 border-white">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default AppHeader;