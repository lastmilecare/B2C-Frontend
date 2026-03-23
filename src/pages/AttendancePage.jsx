import React, { useState } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"

import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts"

import { cookie } from "../utils/cookie"

const AttendancePage = () => {
  const role = cookie.get("role") || "admin"
  const username = cookie.get("username") || "Rohan"
//  TEST USER VIEW
// const role = "user"
// const username = "Rohan"

  const users = ["Rohan", "Priya", "Amit"]
  const [selectedUser, setSelectedUser] = useState(username)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const attendance = [
    { user: "Rohan", date: "2026-03-01", status: "Present" },
    { user: "Rohan", date: "2026-03-02", status: "Absent" },
    { user: "Rohan", date: "2026-03-03", status: "Present" },
    { user: "Priya", date: "2026-03-01", status: "Present" },
    { user: "Amit", date: "2026-03-03", status: "Absent" },
  ]


  const activeUser = role === "admin" ? selectedUser : username
  const getStatus = (date) => {
    const d = date.toISOString().split("T")[0]

    const found = attendance.find(a =>
      a.date === d && a.user === activeUser
    )

    return found?.status || "Absent"
  }
  const month = selectedDate.getMonth()
  const year = selectedDate.getFullYear()
  const monthly = attendance.filter(a => {
    const d = new Date(a.date)
    return (
      d.getMonth() === month &&
      d.getFullYear() === year &&
      a.user === activeUser
    )
  })

  const present = monthly.filter(a => a.status === "Present").length
  const absent = monthly.filter(a => a.status === "Absent").length
  const total = present + absent
  const percent = total === 0 ? 0 : Math.round((present / total) * 100)
  const filteredData = attendance.filter(a => {

    if (role !== "admin" && a.user !== username) return false

    const matchName = a.user.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter ? a.status === statusFilter : true
    const matchDate = dateFilter ? a.date === dateFilter : true

    return matchName && matchStatus && matchDate
  })

  return (
    <div className="p-6 space-y-6">

     
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Attendance Dashboard</h2>

        {role === "admin" && (
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="border px-3 py-2 rounded-xl"
          >
            {users.map(u => <option key={u}>{u}</option>)}
          </select>
        )}
      </div>

      
      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white p-4 rounded-2xl shadow">
          <p>Total Days</p>
          <h2 className="text-2xl font-bold">{total}</h2>
        </div>

        <div className="bg-green-50 p-4 rounded-2xl shadow">
          <p>Present</p>
          <h2 className="text-2xl font-bold text-green-600">{present}</h2>
        </div>

        <div className="bg-red-50 p-4 rounded-2xl shadow">
          <p>Absent</p>
          <h2 className="text-2xl font-bold text-red-500">{absent}</h2>
        </div>

        <div className="bg-indigo-50 p-4 rounded-2xl shadow">
          <p>Attendance %</p>
          <h2 className="text-2xl font-bold text-indigo-600">{percent}%</h2>
        </div>

      </div>

     
      <div className="grid grid-cols-3 gap-6">

        
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow">

          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={({ date }) => {
              const status = getStatus(date)

              return (
                <div className="flex justify-center mt-1">
                  {status === "Present" && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                  {status === "Absent" && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                </div>
              )
            }}
          />

        </div>

       
        <div className="space-y-6">

          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-5 rounded-2xl shadow">
            <p>{selectedDate.toDateString()}</p>
            <h3 className="text-xl font-bold">{getStatus(selectedDate)}</h3>
          </div>

         
          <div className="relative bg-white p-5 rounded-2xl shadow flex flex-col items-center">

            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Present", value: present },
                    { name: "Absent", value: absent }
                  ]}
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute text-center top-[60px]">
              <p className="text-lg font-bold">{percent}%</p>
              <p className="text-xs text-gray-500">Attendance</p>
            </div>

          </div>

        </div>

      </div>

      {/* BAR CHART */}
      {/* <div className="bg-white p-5 rounded-2xl shadow">

        <h4 className="mb-3 font-semibold">Weekly Attendance</h4>

        <div className="h-[180px]">

          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { day: "Mon", present: 1 },
                { day: "Tue", present: 0 },
                { day: "Wed", present: 1 },
                { day: "Thu", present: 1 },
                { day: "Fri", present: 0 },
                { day: "sat", present: 4 },
              ]}
              barSize={25}
            >
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="present" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

        </div>

      </div> */}
      {role === "admin" && (
      <div className="bg-white p-4 rounded-2xl shadow flex gap-3 flex-wrap">
        <input
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-xl"
        />

        <input
          type="date"
          onChange={(e) => setDateFilter(e.target.value)}
          className="border px-3 py-2 rounded-xl"
        />

        <select
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded-xl"
        >
          <option value="">All</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>

      </div>
      )
    }
      {role === "admin" && (
      <div className="bg-white p-6 rounded-2xl shadow">

  <h3 className="mb-4 font-semibold">Team Attendance</h3>

  <div className="overflow-x-auto">
    <table className="w-full text-sm table-fixed">

      
      <thead>
        <tr className="border-b text-gray-500 text-left">
          <th className="py-3 w-[40%]">Employee</th>
          <th className="w-[30%]">Date</th>
          <th className="w-[30%]">Status</th>
        </tr>
      </thead>

     
      <tbody>

        {filteredData.map((a, i) => (

          <tr key={i} className="border-b hover:bg-gray-50 transition">

           
            <td className="py-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center">
                  {a.user[0]}
                </div>
                {a.user}
              </div>
            </td>

            <td className="py-3">
              {a.date}
            </td>

           
            <td className="py-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  a.status === "Present"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-500"
                }`}
              >
                {a.status}
              </span>
            </td>

          </tr>

        ))}

      </tbody>

    </table>
  </div>

</div>
      )}

    </div>
  )
  
}

export default AttendancePage