import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Withdraw() {
  const { accountId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    amount: "",
    transaction_pin: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Withdraw amount must be greater than 0");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/withdraw", {
        account_id: accountId,
        amount: form.amount,
        transaction_pin: form.transaction_pin
      });

      alert(res.data.message);
      navigate("/accounts");
    } catch (error) {
      setError(error.response?.data?.message || "Withdraw failed");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content">
        <div className="auth-container">
          <h2>Withdraw Money</h2>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <form onSubmit={handleWithdraw} className="stack-form">
            <input
              type="number"
              name="amount"
              placeholder="Enter amount"
              value={form.amount}
              onChange={handleChange}
              required
              autoComplete="off"
            />

            <input
              type="password"
              name="transaction_pin"
              placeholder="Enter transaction PIN"
              value={form.transaction_pin}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />

            <button type="submit">Withdraw</button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Withdraw;