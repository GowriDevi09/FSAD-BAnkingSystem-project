  import React, { useEffect, useState } from "react";
  import { Link } from "react-router-dom";
  import axios from "axios";
  import Navbar from "./Navbar";
  import Footer from "./Footer";

  function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user"));

    const [accounts, setAccounts] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userCount, setUserCount] = useState(0);

    // 🔹 Fetch accounts + transactions
    const fetchAccounts = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `http://localhost:5000/accounts/${user.id}`
        );
        setAccounts(res.data);

        if (res.data.length > 0) {
          const transactionPromises = res.data.map((acc) =>
            axios.get(`http://localhost:5000/transactions/${acc.id}`)
          );

          const transactionResponses = await Promise.all(
            transactionPromises
          );

          const allTransactions = transactionResponses
            .flatMap((response) => response.data)
            .sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
            )
            .slice(0, 5);

          setRecentTransactions(allTransactions);
        } else {
          setRecentTransactions([]);
        }
      } catch (error) {
        console.log("Dashboard fetch error:", error);
        setRecentTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    // 🔹 Fetch total users (admin stat)
    const fetchUserCount = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/admin/stats"
        );

        setUserCount(res.data.totalUsers);
      } catch (error) {
        console.log("User count fetch error:", error);
      }
    };

    useEffect(() => {
      if (user?.id) {
        fetchAccounts();
        fetchUserCount();
      }
    }, [user?.id]);

    return (
      <div className="page-wrapper">
        <Navbar />

        <div className="page-content">
          <div className="container">
            <h3>Banking Services</h3>

            {loading ? (
              <p>Loading dashboard...</p>
            ) : (
              <div className="service-grid">
                <Link to="/accounts" className="service-card">
                  <div className="service-icon">💳</div>
                  <h3>Accounts</h3>
                  <p>
                    View accounts, deposit, withdraw, and check balances.
                  </p>
                </Link>

                <Link to="/transfer" className="service-card">
                  <div className="service-icon">🔁</div>
                  <h3>Transfer</h3>
                  <p>
                    Send money using account number or mobile number.
                  </p>
                </Link>

                <Link
                  to={
                    accounts.length > 0
                      ? `/transactions/${accounts[0].id}`
                      : "/accounts"
                  }
                  className="service-card"
                >
                  <div className="service-icon">📜</div>
                  <h3>Recent Transactions</h3>
                  <p>
                    Click to view full transaction history for your account.
                  </p>
                </Link>

                {/* ✅ Admin Stat Card */}
                {user?.role === "admin" && (
                  <div className="service-card">
                    <div className="service-icon">👥</div>
                    <h3>Total Users</h3>
                    <p>{userCount}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  export default Dashboard;