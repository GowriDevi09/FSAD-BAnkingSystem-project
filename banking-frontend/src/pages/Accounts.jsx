import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    account_type: "",
    branch_name: "",
    ifsc_code: "",
    initial_deposit: "",
    transaction_pin: ""
  });

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/accounts/${user.id}`);
      setAccounts(res.data);
    } catch (error) {
      alert("Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchAccounts();
  }, [user?.id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/create-account", {
        user_id: user.id,
        ...form
      });

      alert("Account created successfully");

      setForm({
        account_type: "",
        branch_name: "",
        ifsc_code: "",
        initial_deposit: "",
        transaction_pin: ""
      });

      fetchAccounts();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create account");
    }
  };

  const handleDelete = async (accountId) => {
    if (!window.confirm("Delete this account?")) return;

    try {
      await axios.delete(`http://localhost:5000/delete-account/${accountId}`);
      fetchAccounts();
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="page-content">
        <div className="container">
          <h2>My Accounts</h2>

          {/* ===== FORM ===== */}
          <form onSubmit={handleCreateAccount}>
            <div className="form-container">

              <div className="form-grid">
                <input
                  name="account_type"
                  placeholder="Account Type"
                  value={form.account_type}
                  onChange={handleChange}
                  required
                />

                <input
                  name="branch_name"
                  placeholder="Branch Name"
                  value={form.branch_name}
                  onChange={handleChange}
                  required
                />

                <input
                  name="ifsc_code"
                  placeholder="IFSC Code"
                  value={form.ifsc_code}
                  onChange={handleChange}
                  required
                />

                <input
                  type="number"
                  name="initial_deposit"
                  placeholder="Initial Deposit"
                  value={form.initial_deposit}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <input
                  type="password"
                  name="transaction_pin"
                  placeholder="Transaction PIN"
                  value={form.transaction_pin}
                  onChange={handleChange}
                  required
                />

                <button type="submit">Create Account</button>
              </div>

            </div>
          </form>

          <hr />

          <h3>Account List</h3>

          {loading ? (
            <p>Loading...</p>
          ) : accounts.length === 0 ? (
            <p>No accounts found</p>
          ) : (
            <ul style={{ padding: 0 }}>
              {accounts.map((acc) => (
                <li key={acc.id} className="account-card">
                  <p><strong>Account Number:</strong> {acc.account_number}</p>
                  <p><strong>Type:</strong> {acc.account_type}</p>
                  <p><strong>Branch:</strong> {acc.branch_name}</p>
                  <p><strong>IFSC:</strong> {acc.ifsc_code}</p>

                  <div className="actions">
                    <Link to={`/deposit/${acc.id}`} className="action-btn">Deposit</Link>
                    <Link to={`/withdraw/${acc.id}`} className="action-btn">Withdraw</Link>
                    <Link to={`/transactions/${acc.id}`} className="action-btn">Transactions</Link>

                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="action-btn"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Accounts;