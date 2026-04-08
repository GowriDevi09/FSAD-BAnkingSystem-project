import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function VerifyOtp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const mobile = localStorage.getItem("mobile");

      await axios.post("http://localhost:5000/verify-otp", {
        mobile,
        otp
      });

      alert("OTP verified successfully");
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="auth-container">
      <h2>Verify OTP</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleVerify} className="stack-form">
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button type="submit">Verify OTP</button>
      </form>

      <p>
        Back to <Link to="/">Login</Link>
      </p>
    </div>
  );
}

export default VerifyOtp;