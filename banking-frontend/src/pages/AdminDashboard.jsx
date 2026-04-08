import React, { useEffect, useState } from "react";
import API from "../services/api";
import UsersList from "./UsersList";
import { useNavigate } from "react-router-dom";
function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    frozenUsers: 0,
  });
const navigate = useNavigate();
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
  try {
    const res = await API.get("/admin/stats");

    console.log("STATS RESPONSE:", res.data); // ✅ ADD HERE

    setStats(res.data);
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
};

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h3>Total Users: {stats.totalUsers}</h3>
      <h3>Active Accounts: {stats.activeUsers}</h3>
      <h3>Frozen Accounts: {stats.frozenUsers}</h3>
<div className="analytics-top-card" onClick={() => navigate("/analytics")}>
  <span>📊</span>
  <div>
    <h4>Analytics</h4>
    <p>View insights</p>
  </div>
</div>
      <UsersList refreshStats={fetchStats} />
    </div>
  );
}

export default AdminDashboard;