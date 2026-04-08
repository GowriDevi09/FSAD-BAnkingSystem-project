import React, { useEffect, useState } from "react";
import API from "../services/api";

function UsersList({ refreshStats }) {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const freezeAccount = async (id) => {
    try {
      await API.put(`/admin/freeze/${id}`);
      fetchUsers();
      refreshStats();
    } catch (error) {
      console.error("Error freezing account:", error);
    }
  };

  const unfreezeAccount = async (id) => {
    try {
      await API.put(`/admin/unfreeze/${id}`);
      fetchUsers();
      refreshStats();
    } catch (error) {
      console.error("Error unfreezing account:", error);
    }
  };

  return (
    <div className="users-section">
      <h2>User Management</h2>

      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.first_name} {user.last_name}</td>
              <td>{user.mobile}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.account_status}</td>
              <td>
                {user.account_status === "active" ? (
                  <button onClick={() => freezeAccount(user.id)}>Freeze</button>
                ) : (
                  <button onClick={() => unfreezeAccount(user.id)}>Unfreeze</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersList;