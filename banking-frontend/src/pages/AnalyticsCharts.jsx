import React, { useEffect, useState } from "react";
import API from "../services/api";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function AnalyticsCharts() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [summary, setSummary] = useState({
    deposits: 0,
    withdrawals: 0,
    transfers: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchMonthlyTransactions();
      fetchTransactionSummary();
      fetchRecentTransactions();
    }
  }, []);

  const fetchMonthlyTransactions = async () => {
    try {
      const res = await API.get("/admin/monthly-transactions");
      console.log("MONTHLY RESPONSE:", res.data);
      setMonthlyData(res.data);
    } catch (error) {
      console.error("MONTHLY ERROR:", error.response?.data || error.message);
    }
  };

  const fetchTransactionSummary = async () => {
    try {
      const res = await API.get("/admin/transaction-summary");
      console.log("SUMMARY RESPONSE:", res.data);
      setSummary(res.data);
    } catch (error) {
      console.error("SUMMARY ERROR:", error.response?.data || error.message);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const res = await API.get("/admin/recent-transactions");
      console.log("RECENT RESPONSE:", res.data);
      setRecentTransactions(res.data);
    } catch (error) {
      console.error("RECENT ERROR:", error.response?.data || error.message);
    }
  };

  if (!user || user.role !== "admin") {
    return <h2 style={{ textAlign: "center", marginTop: "40px" }}>Access Denied</h2>;
  }

  const monthlyChartData = {
    labels: monthlyData.map((item) => item.month),
    datasets: [
      {
        label: "Monthly Transactions",
        data: monthlyData.map((item) => Number(item.totalTransactions)),
        backgroundColor: "#2563eb",
        borderColor: "#1d4ed8",
        borderWidth: 1,
        borderRadius: 8,
        barThickness: 50,
      },
    ],
  };

  const summaryChartData = {
    labels: ["Deposits", "Withdrawals", "Transfers"],
    datasets: [
      {
        data: [
          Number(summary.deposits) || 0.1,
          Number(summary.withdrawals) || 0.1,
          Number(summary.transfers) || 0.1,
        ],
        backgroundColor: [
          "#22c55e",
          "#f97316",
          "#3b82f6",
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#1e3a8a",
          font: {
            size: 14,
            weight: "600",
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#475569",
          font: {
            size: 14,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#475569",
          stepSize: 1,
        },
        grid: {
          color: "rgba(148, 163, 184, 0.2)",
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#1e3a8a",
          font: {
            size: 14,
            weight: "600",
          },
        },
      },
    },
  };

  const latestTransactionDate =
    recentTransactions.length > 0
      ? new Date(recentTransactions[0].created_at).toLocaleDateString()
      : "No transactions";

  return (
    <div className="analytics-container">
      <h1 className="page-title">Analytics Dashboard</h1>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Monthly Transactions</h3>
          <div style={{ height: "250px" }}>
            <Bar data={monthlyChartData} options={barOptions} />
          </div>
          <p style={{ marginTop: "12px", color: "#475569", fontSize: "14px" }}>
            Latest Transaction Date: <strong>{latestTransactionDate}</strong>
          </p>
        </div>

        <div className="chart-card">
          <h3>Deposit / Withdraw / Transfer</h3>
          <div style={{ height: "280px" }}>
            <Doughnut data={summaryChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="recent-card">
        <h3>Recent Transactions</h3>
        <table className="users-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((txn) => (
                <tr key={txn.id}>
                  <td>{txn.type}</td>
                  <td>₹{txn.amount}</td>
                  <td>{txn.description}</td>
                  <td>{txn.status}</td>
                  <td>{new Date(txn.created_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No recent transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AnalyticsCharts;