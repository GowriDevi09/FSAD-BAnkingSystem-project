import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    mobile: "",
    email: "",
    password: "",
    confirm_password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
  e.preventDefault();
  setError("");

  if (form.mobile.length !== 10) {
    setError("Mobile number must be exactly 10 digits");
    return;
  }

  if (form.password.length < 6) {
    setError("Password must be at least 6 characters");
    return;
  }

  if (form.password !== form.confirm_password) {
    setError("Passwords do not match");
    return;
  }

  try {
    const res = await axios.post("http://localhost:5000/register", {
      first_name: form.first_name,
      last_name: form.last_name,
      mobile: form.mobile,
      email: form.email,
      password: form.password
    });

    localStorage.setItem("mobile", form.mobile);
    alert(`OTP: ${res.data.demoOtp}`);
    navigate("/verify-otp");
  } catch (error) {
    if (error.response?.data?.error?.code === "ER_DUP_ENTRY") {
      setError("Mobile number or email already registered.");
    } else {
      setError(error.response?.data?.message || "Registration failed.");
    }
  }
};
  return (
    <div className="auth-container">
      <h2>Register</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleRegister} className="stack-form">
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          required
          autoComplete="off"
        />

        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          required
          autoComplete="off"
        />

        <input
          type="text"
          name="mobile"
          placeholder="Mobile Number"
          value={form.mobile}
          onChange={handleChange}
          required
          autoComplete="off"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="off"
          />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="off"
        />

        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          value={form.confirm_password}
          onChange={handleChange}
          required
          autoComplete="off"
        />

        <button type="submit">Register</button>
      </form>

      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
}

export default Register;