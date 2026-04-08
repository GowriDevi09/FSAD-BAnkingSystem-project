import React, { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

function ViewBalance() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [password, setPassword] = useState("");
  const [balances, setBalances] = useState([]);
  const [error, setError] = useState("");

  const handleViewBalance = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/view-balance", {
        user_id: user.id,
        password
      });

      setBalances(res.data.accounts);
    } catch (error) {
      setBalances([]);
      setError(error.response?.data?.message || "Failed to fetch balances");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="page-content">
        <div className="container">
          <h2>View Balance</h2>

          <form onSubmit={handleViewBalance} className="stack-form">
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Check Balance</button>
          </form>

          {error && <p style={{ color: "red" }}>{error}</p>}

          {balances.length > 0 && (
            <div className="dashboard-cards">
              {balances.map((acc, index) => (
                <div key={index} className="account-card">
                  <p><strong>Account Type:</strong> {acc.account_type}</p>
                  <p><strong>Account Number:</strong> {acc.account_number}</p>
                  <p><strong>Balance:</strong> ₹{acc.balance}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ViewBalance;