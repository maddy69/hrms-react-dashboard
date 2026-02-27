import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Search, UserPlus, Calendar, Trash2, X } from 'lucide-react';

const API_URL = "https://hrms-backend-final-ep2x.onrender.com";

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ total_employees: 0, present_today: 0, absent_today: 0 });
  const [globalDate, setGlobalDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyStatusMap, setDailyStatusMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [history, setHistory] = useState([]);
  const [modalDate, setModalDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalStatus, setModalStatus] = useState('Present');

  // Form State
  const [formData, setFormData] = useState({ employee_id: '', name: '', email: '', department: '' });

  // Load Data
  const loadData = async () => {
    try {
      // Fetch Stats
      const statRes = await fetch(`${API_URL}/stats?target_date=${globalDate}`);
      if (statRes.ok) setStats(await statRes.json());

      // Fetch Daily Logs for Status Column
      const dailyRes = await fetch(`${API_URL}/attendance/daily/${globalDate}`);
      if (dailyRes.ok) {
        const logs = await dailyRes.json();
        const statusMap = {};
        logs.forEach(log => statusMap[log.employee_id] = log.status);
        setDailyStatusMap(statusMap);
      }

      // Fetch Employees
      const empRes = await fetch(`${API_URL}/employees/`);
      if (empRes.ok) setEmployees(await empRes.json());
      
    } catch (err) {
      console.error("Failed to fetch data. Is the backend running?");
    }
  };

  useEffect(() => {
    loadData();
  }, [globalDate]);

  // Handlers
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/employees/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ employee_id: '', name: '', email: '', department: '' });
        loadData();
      } else {
        const err = await res.json();
        alert(err.detail);
      }
    } catch (err) { alert("Network Error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Permanently delete employee?")) return;
    await fetch(`${API_URL}/employees/${id}`, { method: 'DELETE' });
    loadData();
  };

  const openAttendanceModal = async (emp) => {
    setSelectedEmp(emp);
    setModalDate(globalDate);
    const res = await fetch(`${API_URL}/attendance/${emp.id}`);
    if (res.ok) setHistory(await res.json());
    setIsModalOpen(true);
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    const data = { employee_id: selectedEmp.id, date: modalDate, status: modalStatus };
    const res = await fetch(`${API_URL}/attendance/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const histRes = await fetch(`${API_URL}/attendance/${selectedEmp.id}`);
      if (histRes.ok) setHistory(await histRes.json());
      loadData(); // Refresh main dashboard
    } else {
      const err = await res.json();
      alert(err.detail);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">HRMS<span className="text-blue-600">Lite</span></span>
          </div>
          <div className="flex items-center gap-3 bg-slate-100 py-1.5 px-3 rounded-md border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input 
              type="date" 
              value={globalDate}
              onChange={(e) => setGlobalDate(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 cursor-pointer"
            />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Employees</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.total_employees}</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-full"><Users className="w-6 h-6 text-blue-600" /></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Present Today</p>
              <h3 className="text-3xl font-bold text-emerald-600">{stats.present_today}</h3>
            </div>
            <div className="bg-emerald-50 p-3 rounded-full"><UserCheck className="w-6 h-6 text-emerald-600" /></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Absent Today</p>
              <h3 className="text-3xl font-bold text-rose-600">{stats.absent_today}</h3>
            </div>
            <div className="bg-rose-50 p-3 rounded-full"><UserX className="w-6 h-6 text-rose-600" /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Employee Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Add New Employee
              </h2>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Employee ID</label>
                  <input type="text" required placeholder="EMP-001" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm" value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                  <input type="text" required placeholder="Jane Doe" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                  <input type="email" required placeholder="jane@company.com" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                  <input type="text" required placeholder="Engineering" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors shadow-sm">
                  Add to Directory
                </button>
              </form>
            </div>
          </div>

          {/* Directory Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800">Directory</h2>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search employees..." 
                    className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-shadow"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                      <th className="p-4">Employee</th>
                      <th className="p-4">Status ({globalDate})</th>
                      <th className="p-4 text-center">Metrics (All-time)</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.length === 0 ? (
                      <tr><td colSpan="4" className="p-8 text-center text-slate-500">No employees found.</td></tr>
                    ) : filteredEmployees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{emp.name}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{emp.employee_id} • {emp.department}</div>
                        </td>
                        <td className="p-4">
                          {dailyStatusMap[emp.id] === 'Present' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Present
                            </span>
                          ) : dailyStatusMap[emp.id] === 'Absent' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Absent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              Not Marked
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-4 text-xs font-medium">
                            <div className="text-emerald-600 flex flex-col items-center"><span className="text-lg">{emp.total_present}</span> Pres</div>
                            <div className="text-rose-600 flex flex-col items-center"><span className="text-lg">{emp.total_absent}</span> Abs</div>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => openAttendanceModal(emp)} className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors mr-2">
                            Log
                          </button>
                          <button onClick={() => handleDelete(emp.id)} className="text-rose-600 hover:text-rose-800 p-1.5 hover:bg-rose-50 rounded-md transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Attendance Log</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedEmp?.name} ({selectedEmp?.employee_id})</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleMarkAttendance} className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mark Entry</label>
                <div className="flex gap-2">
                  <input type="date" className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={modalDate} onChange={(e) => setModalDate(e.target.value)} required />
                  <select className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium" value={modalStatus} onChange={(e) => setModalStatus(e.target.value)}>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                  <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Save</button>
                </div>
              </form>

              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Historical Records</h4>
              <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No historical records found.</p>
                ) : (
                  <ul className="space-y-2">
                    {[...history].sort((a,b) => new Date(b.date) - new Date(a.date)).map(rec => (
                      <li key={rec.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-white shadow-sm">
                        <span className="font-mono text-sm text-slate-600">{rec.date}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${rec.status === 'Present' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {rec.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
