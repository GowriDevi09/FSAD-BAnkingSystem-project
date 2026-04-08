import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="page-content">
        <div className="container">
          <h2>Profile</h2>

          <div className="account-card">
            <p><strong>Name:</strong> {user?.first_name} {user?.last_name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Mobile:</strong> {user?.mobile}</p>
          </div>

          <h3>Profile Services</h3>

<div className="service-grid">

  <div
    className="service-card balance-card"
    onClick={() => navigate("/view-balance")}
  >
    <div className="service-icon">💰</div>

    <h3>View Balance</h3>

    <p>Securely check your account balances.</p>

    <button className="card-button">
      Check Balance
    </button>
  </div>

</div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Profile;