import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const ROLES = ["admin", "customer"];
const STATUSES = ["active", "inactive", "banned"];
const PAGE_SIZE = 5;
const API_BASE = "https://biz4293.pythonanywhere.com";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters & pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  // For editing
  const [editingUserId, setEditingUserId] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  // Fetch users from backend with filters & pagination
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const params = {
        search: searchTerm || undefined,
        role: filterRole || undefined,
        status: filterStatus || undefined,
        page,
        limit: PAGE_SIZE,
      };

      const response = await axios.get(`${API_BASE}/api/get_users`, { params });

      setUsers(response.data.users || []);
      setTotalUsers(response.data.total || 0);
    } catch (err) {
      setError("Failed to load users.");
    }
    setLoading(false);
  };

  // Initial fetch and refetch when filters change
  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filterRole, filterStatus, page]);

  // Real-time updates via socket.io
  useEffect(() => {
    const socket = io(API_BASE, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to socket.io server");
    });

    socket.on("user_added", () => {
      console.log("New user added - refreshing list");
      fetchUsers();
    });

    socket.on("user_updated", () => {
      console.log("User updated - refreshing list");
      fetchUsers();
    });

    socket.on("user_deleted", () => {
      console.log("User deleted - refreshing list");
      fetchUsers();
    });

    socket.on("disconnect", () => {
      console.warn("Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Delete user handler
  const handleDelete = async (user_id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${API_BASE}/api/delete_users/${user_id}`);
      setSuccessMessage("User deleted successfully.");
      setError(null);
      await fetchUsers();
    } catch (err) {
      setError(
        "Failed to delete user: " +
          (err.response?.data?.error || err.message)
      );
      setSuccessMessage(null);
    }
  };

  // Start editing user
  const startEditing = (user) => {
    setEditingUserId(user.user_id);
    setEditRole(user.role);
    setEditStatus(user.status);
    setSuccessMessage(null);
    setError(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingUserId(null);
    setEditRole("");
    setEditStatus("");
    setError(null);
    setSuccessMessage(null);
  };

  // Save edited user data
  const saveEdit = async () => {
    if (!editingUserId) return;

    try {
      await axios.patch(
        `${API_BASE}/api/update_user/${editingUserId}`,
        { role: editRole, status: editStatus }
      );
      setSuccessMessage("User updated successfully.");
      setError(null);
      setEditingUserId(null);
      fetchUsers();
    } catch (err) {
      setError(
        "Failed to update user: " +
          (err.response?.data?.error || err.message)
      );
      setSuccessMessage(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      {/* Success & Error Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="search"
          placeholder="Search by name or email"
          className="border px-3 py-2 rounded-md w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#8c5e3b]"
          value={searchTerm}
          onChange={(e) => {
            setPage(1);
            setSearchTerm(e.target.value);
          }}
        />
        <select
          value={filterRole}
          onChange={(e) => {
            setPage(1);
            setFilterRole(e.target.value);
          }}
          className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c5e3b]"
        >
          <option value="">All Roles</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => {
            setPage(1);
            setFilterStatus(e.target.value);
          }}
          className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c5e3b]"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <table className="min-w-full border border-gray-300 rounded-md overflow-hidden">
            <thead className="bg-[#8c5e3b] text-white">
              <tr>
                <th className="p-3 text-left">Profile</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Last Login</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-6">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <React.Fragment key={user.user_id}>
                    <tr className="border-t border-gray-300 hover:bg-gray-100">
                      <td className="p-2">
                        {user.profile_photo ? (
                          <img
                            src={`${API_BASE}/static/images/${user.profile_photo}`}
                            alt="profile"
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center font-bold text-white">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="p-2">{user.name}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2 capitalize">{user.role}</td>
                      <td className="p-2 capitalize">{user.status}</td>
                      <td className="p-2">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleString()
                          : "Never"}
                      </td>
                      <td className="p-2 space-x-2">
                        <button
                          onClick={() => startEditing(user)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.user_id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>

                    {editingUserId === user.user_id && (
                      <tr>
                        <td colSpan="7" className="bg-gray-50 p-4">
                          <div className="max-w-md mx-auto bg-white rounded shadow p-4">
                            <h3 className="text-xl font-semibold mb-4">
                              Edit User: {user.name}
                            </h3>

                            <label className="block mb-2 font-medium">
                              Role:
                            </label>
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                              className="w-full border px-3 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-[#8c5e3b]"
                            >
                              {ROLES.map((role) => (
                                <option key={role} value={role}>
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </option>
                              ))}
                            </select>

                            <label className="block mb-2 font-medium">
                              Status:
                            </label>
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="w-full border px-3 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-[#8c5e3b]"
                            >
                              {STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                                </option>
                              ))}
                            </select>

                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={cancelEditing}
                                className="px-4 py-2 rounded border hover:bg-gray-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={saveEdit}
                                className="px-4 py-2 bg-[#8c5e3b] text-white rounded hover:bg-[#7a4f2f]"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="mt-6 flex justify-center items-center space-x-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded border ${
                page === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-200"
              }`}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded border ${
                page === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-200"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserManagement;
