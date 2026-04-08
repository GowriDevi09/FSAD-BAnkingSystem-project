import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("mobile");
    navigate("/");
  };

  return (
    <div className="navbar">
      <h3 className="logo">MyBank</h3>

      <div className="nav-items">
        <button type="button" onClick={() => navigate("/dashboard")}>
          🏠 Dashboard
        </button>

        <button type="button" onClick={() => navigate("/profile")}>
          👤 Profile
        </button>

        <button type="button" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;