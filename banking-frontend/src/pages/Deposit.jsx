import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Deposit() {
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

  const handleDeposit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Deposit amount must be greater than 0");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/deposit", {
        account_id: accountId,
        amount: form.amount,
        transaction_pin: form.transaction_pin
      });

      alert(res.data.message);
      navigate("/accounts");
    } catch (error) {
      setError(error.response?.data?.message || "Deposit failed");
    }
  };

  return (
  <div className="page-wrapper">
    <Navbar />

    <div className="page-content transaction-page">

      <div className="transaction-card">
        <h2>Deposit Money</h2>

        {error && <p style={{color:"red"}}>{error}</p>}

        <form onSubmit={handleDeposit}>

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
            placeholder="Transaction PIN"
            value={form.transaction_pin}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />

          <button type="submit">Deposit</button>

          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/accounts")}
          >
            Cancel
          </button>

        </form>
      </div>

    </div>

    <Footer />
  </div>
);
}

export default Deposit;