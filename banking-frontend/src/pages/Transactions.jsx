import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Transactions() {
  const { accountId } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/transactions/${accountId}`);
      setTransactions(res.data);
    } catch (error) {
      alert("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [accountId]);

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="page-content">
        <div className="container">
          <h2>Transaction History</h2>

          {loading ? (
            <p>Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <ul>
              {transactions.map((txn) => (
                <li key={txn.id} className="account-card">
                  <p><strong>Type:</strong> {txn.type}</p>
                  <p><strong>Amount:</strong> ₹{txn.amount}</p>
                  <p><strong>Description:</strong> {txn.description}</p>
                  <p><strong>Status:</strong> {txn.status}</p>
                  <p><strong>Date:</strong> {new Date(txn.created_at).toLocaleString()}</p>
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

export default Transactions;