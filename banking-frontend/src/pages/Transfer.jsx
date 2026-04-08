import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Transfer() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    sender_account_id: "",
    receiver_account_number: "",
    receiver_mobile: "",
    amount: "",
    transaction_pin: ""
  });

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/accounts/${user.id}`);
      setAccounts(res.data);
    } catch (error) {
      alert("Failed to fetch accounts");
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAccounts();
    }
  }, [user?.id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!form.receiver_account_number && !form.receiver_mobile) {
      alert("Enter receiver account number or mobile number");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      alert("Transfer amount must be greater than 0");
      return;
    }

    const receiverValue = form.receiver_account_number || form.receiver_mobile;

    const isConfirmed = window.confirm(
      `Transfer ₹${form.amount} to ${receiverValue}?`
    );

    if (!isConfirmed) return;

    try {
      const res = await axios.post("http://localhost:5000/transfer-flex", {
        sender_account_id: form.sender_account_id,
        receiver_account_number: form.receiver_account_number || null,
        receiver_mobile: form.receiver_mobile || null,
        amount: form.amount,
        transaction_pin: form.transaction_pin
      });

      alert(res.data.message);

      setForm({
        sender_account_id: "",
        receiver_account_number: "",
        receiver_mobile: "",
        amount: "",
        transaction_pin: ""
      });

      fetchAccounts();
    } catch (error) {
      alert(error.response?.data?.message || "Transfer failed");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="page-content">
        <div className="container">
          <h2>Transfer Money</h2>

          <form onSubmit={handleTransfer}>

  <div className="transfer-container">

    <div className="transfer-form">

      {/* SELECT ACCOUNT */}
      <select
        name="sender_account_id"
        value={form.sender_account_id}
        onChange={handleChange}
        required
      >
        <option value="">Choose sender account</option>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.account_number}
          </option>
        ))}
      </select>

      {/* RECEIVER DETAILS */}
      <input
        type="text"
        name="receiver_account_number"
        placeholder="Receiver Account Number"
        value={form.receiver_account_number}
        onChange={handleChange}
      />

      <input
        type="text"
        name="receiver_mobile"
        placeholder="Receiver Mobile Number"
        value={form.receiver_mobile}
        onChange={handleChange}
      />

      {/* AMOUNT + PIN (SIDE BY SIDE) */}
      <div className="transfer-row">
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="transaction_pin"
          placeholder="PIN"
          value={form.transaction_pin}
          onChange={handleChange}
          required
        />
      </div>

      {/* BUTTON */}
      <button type="submit">Transfer</button>

    </div>

  </div>

</form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Transfer;