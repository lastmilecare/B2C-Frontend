import React, { useState, useMemo, useCallback, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  PieChart, Pie, Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { 
  ArrowDownTrayIcon, 
  PlayIcon, 
  PowerIcon, 
  FingerPrintIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  CalendarIcon
} from "@heroicons/react/24/solid";

import { cookie } from "../utils/cookie";
import { healthAlert } from "../utils/healthSwal";
import CommonListCopy from "../components/CommonListCopy"; 
import CopyFilterBar from "../components/copy/CopyFilterBar";

const AttendancePage = () => {
  
  const role = cookie.get("role") || "USER"; 
  const username = cookie.get("username") || "Pooja Jaiswal";

  const [viewingEmployee, setViewingEmployee] = useState(null); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState([
    { user: "Rohan", date: "2026-03-24", status: "Present" },
    { user: "Rohan", date: "2026-03-23", status: "Present" },
    { user: "Pooja Jaiswal", date: "2026-03-24", status: "Present" },
    { user: "Pooja Jaiswal", date: "2026-02-15", status: "Present" },
    { user: "Priya", date: "2026-03-24", status: "Absent" },
    { user: "Amit", date: "2026-03-24", status: "Present" },
    { user: "Anjali", date: "2026-03-24", status: "Present" },
  ]);
  const [tempFilters, setTempFilters] = useState({ user: "", status: "", date: "" });
  const [appliedFilters, setAppliedFilters] = useState({});
  const [viewConfig, setViewConfig] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });
  const formatLocalDate = useCallback((dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const companyHolidays = useMemo(() => [
    "2026-01-26", "2026-08-15", "2026-10-02", "2026-12-25"
  ], []);
  const handleStartDuty = () => {
    const todayStr = formatLocalDate(new Date());
    const alreadyMarked = attendance.find(a => a.user === username && a.date === todayStr);

    if (alreadyMarked) {
      healthAlert({
        title: "Status: Active",
        text: "Bhai, aapki aaj ki attendance pehle se hi recorded hai.",
        icon: "info"
      });
      return;
    }

    setAttendance(prev => [...prev, { user: username, date: todayStr, status: "Present" }]);
    healthAlert({
      title: "Duty Initiated!",
      text: `Jai Hind ${username}! Aapka session start ho chuka hai.`,
      icon: "success"
    });
  };

  const handleEndDuty = () => {
    const todayStr = formatLocalDate(new Date());
    const isStarted = attendance.find(a => a.user === username && a.date === todayStr);

    if (!isStarted) {
      healthAlert({
        title: "Access Denied",
        text: "Pehle duty start toh karo, tabhi toh end hogi!",
        icon: "warning"
      });
      return;
    }
    healthAlert({
      title: "Duty Completed!",
      text: "Shabash! Aaj ka session closed. Have a great evening!",
      icon: "success"
    });
  };

  const adminDashboardStats = useMemo(() => {
    const todayStr = formatLocalDate(new Date());
    const todaysData = attendance.filter(a => a.date === todayStr);
    const totalStaff = 6;
    const presentToday = todaysData.filter(a => a.status === "Present").length;
    const absentToday = totalStaff - presentToday;
    const score = totalStaff === 0 ? 0 : Math.round((presentToday / totalStaff) * 100);
    
    return { totalStaff, presentToday, absentToday, score, todaysData };
  }, [attendance, formatLocalDate]);
  const detailStats = useMemo(() => {
    const targetUser = viewingEmployee || username;
    const today = new Date();
    const monthlyRecords = attendance.filter(a => {
      const d = new Date(a.date);
      return a.user === targetUser && 
             d.getMonth() === viewConfig.month && 
             d.getFullYear() === viewConfig.year;
    });

    const totalDaysInSelectedMonth = new Date(viewConfig.year, viewConfig.month + 1, 0).getDate();
    
    let workingDaysCount = 0;
    for (let i = 1; i <= totalDaysInSelectedMonth; i++) {
      const loopDate = new Date(viewConfig.year, viewConfig.month, i);
      const loopDateStr = formatLocalDate(loopDate);
      
      const isSunday = loopDate.getDay() === 0;
      const isHoliday = companyHolidays.includes(loopDateStr);
      
      if (!isSunday && !isHoliday && loopDate <= today) {
        workingDaysCount++;
      }
    }

    const present = monthlyRecords.filter(a => a.status === "Present").length;
    const absent = Math.max(0, workingDaysCount - present);
    const percent = workingDaysCount === 0 ? 0 : Math.round((present / workingDaysCount) * 100);

    return { totalDaysInSelectedMonth, workingDaysCount, present, absent, percent };
  }, [viewingEmployee, viewConfig, attendance, username, formatLocalDate, companyHolidays]);

  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const dStr = formatLocalDate(date);
      const isSunday = date.getDay() === 0;
      const isHoliday = companyHolidays.includes(dStr);
      const isFuture = date > new Date();

      if (isSunday || isHoliday || isFuture) return null;

      const targetUser = viewingEmployee || username;
      const record = attendance.find(a => a.date === dStr && a.user === targetUser);
      const status = record?.status === "Present" ? "Present" : "Absent";

      return (
        <div className="flex justify-center mt-1">
          <div className={`w-1.5 h-1.5 rounded-full ${
            status === "Present" 
            ? "bg-green-500 shadow-[0_0_8px_#22c55e]" 
            : "bg-red-500 shadow-[0_0_8px_#ef4444]"
          }`}></div>
        </div>
      );
    }
    return null;
  };

  const filteredRecords = useMemo(() => {
    const todayStr = formatLocalDate(new Date());
    const targetDate = appliedFilters.date || todayStr;

    return attendance.filter(item => {
      const matchDate = item.date === targetDate;
      const matchName = appliedFilters.user 
        ? item.user.toLowerCase().includes(appliedFilters.user.toLowerCase()) 
        : true;
      const matchStatus = appliedFilters.status 
        ? item.status === appliedFilters.status 
        : true;
      return matchDate && matchName && matchStatus;
    });
  }, [appliedFilters, attendance, formatLocalDate]);
  if (role === "admin" && viewingEmployee) {
    return (
      <div className="p-8 space-y-10 animate-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100">
          <div className="flex items-center gap-6">
            <button onClick={() => setViewingEmployee(null)} className="h-12 w-12 bg-sky-50 text-sky-600 rounded-2xl hover:bg-sky-600 hover:text-white transition-all flex items-center justify-center font-black shadow-inner">
               <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">{viewingEmployee}</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Yearly Performance Archive</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
           
             <select 
               className="bg-gray-50 border-none px-6 py-3 rounded-2xl text-xs font-black uppercase outline-none focus:ring-2 focus:ring-sky-400"
               value={viewConfig.month}
               onChange={(e) => setViewConfig({...viewConfig, month: parseInt(e.target.value)})}
             >
                {Array.from({length: 12}, (_, i) => <option key={i} value={i}>{new Date(0, i).toLocaleString('en', {month: 'long'})}</option>)}
             </select>
             
             <select 
               className="bg-gray-50 border-none px-6 py-3 rounded-2xl text-xs font-black uppercase outline-none focus:ring-2 focus:ring-sky-400"
               value={viewConfig.year}
               onChange={(e) => setViewConfig({...viewConfig, year: parseInt(e.target.value)})}
             >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
             </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard title="Total Target" value={detailStats.workingDaysCount} />
          <StatCard title="Present Days" value={detailStats.present} color="text-green-600" bg="bg-green-50" />
          <StatCard title="Absent Days" value={detailStats.absent} color="text-red-600" bg="bg-red-50" />
          <StatCard title="Accuracy" value={`${detailStats.percent}%`} color="text-indigo-600" bg="bg-indigo-50" />
        </div>
        <div className="flex flex-col xl:flex-row gap-12">
          <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-100 h-fit max-w-fit flex-shrink-0">
             <Calendar 
               activeStartDate={new Date(viewConfig.year, viewConfig.month, 1)}
               value={null}
               tileContent={getTileContent} 
               maxDate={new Date()}
             />
          </div>
          
          <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-100 flex flex-col items-center justify-center flex-1 max-w-md">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Performance Ratio</h4>
             <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie 
                    data={[{ name: "P", value: detailStats.present }, { name: "A", value: detailStats.absent }]} 
                    innerRadius={75} outerRadius={100} dataKey="value" stroke="none"
                  >
                    <Cell fill="#10b981" /><Cell fill="#f43f5e" />
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
             <div className="text-center mt-8">
                <p className="text-5xl font-black text-gray-900 tracking-tighter">{detailStats.percent}%</p>
                <p className="text-[10px] text-gray-400 font-black uppercase mt-2 tracking-widest italic">Data for {new Date(0, viewConfig.month).toLocaleString('en', {month: 'long'})} {viewConfig.year}</p>
             </div>
          </div>
        </div>
      </div>
    );
  }
  if (role === "admin") {
    return (
      <div className="p-8 space-y-12 animate-in fade-in duration-1000">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="bg-sky-100 text-sky-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block shadow-sm">Administration</span>
            <h2 className="text-5xl font-black text-sky-950 tracking-tighter leading-none uppercase">Attendence<br/>Dashboard</h2>
          </div>
          <div className="bg-white px-8 py-4 rounded-[2.5rem] border border-gray-100 shadow-sm text-right">
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Global Server Time</p>
             <p className="text-lg font-black text-sky-900 uppercase">{new Date().toDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard title="Active Staff" value={adminDashboardStats.totalStaff} />
          <StatCard title="Present Today" value={adminDashboardStats.presentToday} color="text-green-600" bg="bg-green-50" />
          <StatCard title="Absent Today" value={adminDashboardStats.absentToday} color="text-red-600" bg="bg-red-50" />
          <StatCard title="Team Score" value={`${adminDashboardStats.score}%`} color="text-indigo-600" bg="bg-indigo-50" />
        </div>

        <CopyFilterBar 
          filtersConfig={[
            { name: "user", label: "Staff Name", type: "text", placeholder: "Search member..." },
            { name: "status", label: "Status Filter", type: "select", options: [{label: "Present", value: "Present"}, {label: "Absent", value: "Absent"}] },
            { name: "date", label: "Log Date Selection", type: "date" }
          ]}
          tempFilters={tempFilters}
          onChange={(e) => setTempFilters({...tempFilters, [e.target.name]: e.target.value})}
          onApply={() => setAppliedFilters(tempFilters)}
          onReset={() => {setTempFilters({user:"", status:"", date:""}); setAppliedFilters({});}}
          onExport={() => healthAlert({ title: "Exporting Data", text: "Generating CSV report based on filters...", icon: "success" })}
        />

        <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-50 overflow-hidden">
          <CommonListCopy 
            title={appliedFilters.date ? `REPORT FOR ${appliedFilters.date}` : "LIVE ATTENDANCE FEED (TODAY)"}
            columns={[
              { name: "STAFF MEMBER", selector: r => r.user.toUpperCase(), sortable: true },
              { name: "LOG DATE", selector: r => r.date, sortable: true },
              { name: "STATUS", cell: r => <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${r.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span> }
            ]}
            data={filteredRecords}
            enableActions={true}
            actionButtons={["view"]}
            onView={(row) => setViewingEmployee(row.user)}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="p-8 space-y-8 animate-in zoom-in-95 duration-700">
      <div className="bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-950 px-10 py-6 rounded-[2.5rem] text-white shadow-3xl relative overflow-hidden group">
        <div className="relative z-10 flex justify-between items-center">
          <div className="text-left">
            <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.4em] mb-1 text-sky-400">Employee Attendance</p>
            <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">
              WELCOME , <span className="text-white opacity-100">{username.toUpperCase()}!</span>
            </h2>
          </div>
          <div className="h-16 w-16 bg-white/10 rounded-full backdrop-blur-3xl border border-white/20 flex items-center justify-center text-2xl font-black shadow-2xl hover:scale-110 transition-transform cursor-default">
            {username[0]}
          </div>
        </div>
        <div className="absolute -left-10 -top-10 h-40 w-40 bg-sky-500/20 rounded-full blur-[80px] group-hover:bg-sky-500/30 transition-all duration-1000"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Monthly Work Target" value={detailStats.workingDaysCount} />
        <StatCard title="I'm Present" value={detailStats.present} color="text-green-600" bg="bg-green-50" />
        <StatCard title="I'm Absent" value={detailStats.absent} color="text-red-600" bg="bg-red-50" />
        <StatCard title="My Score" value={`${detailStats.percent}%`} color="text-indigo-600" bg="bg-indigo-50" />
      </div>
      <div className="flex flex-col xl:flex-row gap-12 items-stretch">
        
        <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-100 h-fit max-w-fit flex-shrink-0">
           <div className="flex items-center gap-2 mb-6">
              <CalendarIcon className="h-4 w-4 text-sky-500" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendance Timeline</p>
           </div>
           <Calendar onChange={setSelectedDate} value={selectedDate} tileContent={getTileContent} maxDate={new Date()} />
        </div>
        
        <div className="flex-1 flex flex-col md:flex-row gap-8">
         
           <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-100 flex flex-col items-center justify-center flex-1 max-w-md">
              <ResponsiveContainer width="100%" height={220}>
                 <PieChart>
                   <Pie data={[{ name: "P", value: detailStats.present }, { name: "A", value: detailStats.absent }]} innerRadius={70} outerRadius={95} dataKey="value" stroke="none">
                     <Cell fill="#0ea5e9" /><Cell fill="#f43f5e" />
                   </Pie>
                 </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-6">
                 <p className="text-4xl font-black text-gray-900 tracking-tighter">{detailStats.percent}%</p>
                 <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2">Accuracy Consistency</p>
              </div>
           </div>
           <div className="bg-gradient-to-br from-white via-sky-50 to-indigo-50 p-10 rounded-[3.5rem] shadow-2xl border border-sky-100 flex-1 flex flex-col justify-between">
              <div>
                 <div className="flex items-center gap-4 mb-8">
                    <div className="h-10 w-10 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-200">
                       <FingerPrintIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Biometric System</p>
                       <h4 className="text-lg font-black text-slate-800 uppercase">Duty Marker</h4>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-4">
                    <button 
                       onClick={handleStartDuty}
                       className="flex items-center justify-between bg-white hover:bg-green-50 border border-slate-200 p-6 rounded-3xl transition-all duration-300 group shadow-sm active:scale-95"
                    >
                       <div className="flex items-center gap-4">
                          <PlayIcon className="h-6 w-6 text-green-500 group-hover:scale-125 transition-transform" />
                          <span className="text-sm font-black text-slate-700 uppercase">Start Duty</span>
                       </div>
                       <ClockIcon className="h-4 w-4 text-slate-300" />
                    </button>
                    
                    <button 
                       onClick={handleEndDuty}
                       className="flex items-center justify-between bg-white hover:bg-red-50 border border-slate-200 p-6 rounded-3xl transition-all duration-300 group shadow-sm active:scale-95"
                    >
                       <div className="flex items-center gap-4">
                          <PowerIcon className="h-6 w-6 text-red-500 group-hover:scale-125 transition-transform" />
                          <span className="text-sm font-black text-slate-700 uppercase">End Duty</span>
                       </div>
                       <CheckCircleIcon className="h-4 w-4 text-slate-300" />
                    </button>
                 </div>
              </div>

              <div className="mt-8 p-4 bg-sky-500/5 rounded-2xl border border-sky-500/10 flex items-center gap-3">
                 <MapPinIcon className="h-4 w-4 text-sky-500" />
                 <p className="text-[10px] text-sky-700 font-bold uppercase tracking-tighter italic">LMC Hospital - Secured Zone Terminal</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color = "text-gray-900", bg = "bg-white" }) => (
  <div className={`${bg} p-10 rounded-[3rem] shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group`}>
    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mb-4 group-hover:text-sky-500 transition-colors text-xs">{title}</p>
    <h2 className={`text-5xl font-black ${color} tracking-tighter`}>{value}</h2>
  </div>
);

export default AttendancePage;