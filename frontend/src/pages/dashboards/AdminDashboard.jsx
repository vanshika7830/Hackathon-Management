import { useEffect, useState } from "react";
import { getAllUsers, toggleBlockUser, deleteUser, updateUserRole, createJudge } from "../../services/userService";
import { getAllHackathons, deleteHackathon } from "../../services/hackathonService";
import Pagination from "../../components/common/Pagination";

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [hackathons, setHackathons] = useState([]);
    const [activeTab, setActiveTab] = useState("users"); // "users" | "hackathons"
    const [roleFilter, setRoleFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Pagination states
    const [usersPage, setUsersPage] = useState(1);
    const [hackathonsPage, setHackathonsPage] = useState(1);
    const usersPerPage = 5;
    const hackathonsPerPage = 4;

    // Create Judge Modal State
    const [showJudgeModal, setShowJudgeModal] = useState(false);
    const [judgeForm, setJudgeForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [judgeLoading, setJudgeLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, hackathonsData] = await Promise.all([
                getAllUsers(),
                getAllHackathons(),
            ]);
            setUsers(usersData);
            setHackathons(hackathonsData);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load admin dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleBlock = async (userId) => {
        try {
            setError("");
            setMessage("");
            const res = await toggleBlockUser(userId);
            setMessage(res.message);
            setUsers(users.map((u) => (u._id === userId ? { ...u, isBlocked: res.user.isBlocked } : u)));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update user block status");
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            setError("");
            setMessage("");
            await updateUserRole(userId, newRole);
            setMessage("User role updated successfully!");
            setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update role");
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user ${userName}?`)) return;
        try {
            setError("");
            setMessage("");
            await deleteUser(userId);
            setMessage(`User ${userName} deleted.`);
            setUsers(users.filter((u) => u._id !== userId));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete user");
        }
    };

    const handleDeleteHackathon = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete hackathon "${title}"?`)) return;
        try {
            setError("");
            setMessage("");
            await deleteHackathon(id);
            setMessage(`Hackathon "${title}" deleted.`);
            setHackathons(hackathons.filter((h) => h._id !== id));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete hackathon");
        }
    };

    const handleCreateJudge = async (e) => {
        e.preventDefault();
        setJudgeLoading(true);
        setError("");
        setMessage("");
        try {
            await createJudge(judgeForm);
            setMessage("Judge account created successfully!");
            setShowJudgeModal(false);
            setJudgeForm({ firstName: "", lastName: "", email: "", password: "" });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create judge");
        } finally {
            setJudgeLoading(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const matchesSearch =
            fullName.includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRole && matchesSearch;
    });

    const usersTotalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginatedUsers = filteredUsers.slice((usersPage - 1) * usersPerPage, usersPage * usersPerPage);

    const hackathonsTotalPages = Math.ceil(hackathons.length / hackathonsPerPage);
    const paginatedHackathons = hackathons.slice((hackathonsPage - 1) * hackathonsPerPage, hackathonsPage * hackathonsPerPage);

    const stats = {
        totalUsers: users.length,
        participants: users.filter((u) => u.role === "participant").length,
        organizers: users.filter((u) => u.role === "organizer").length,
        judges: users.filter((u) => u.role === "judge").length,
        totalHackathons: hackathons.length,
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
            {/* Header & Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Admin Command Center
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage users, roles, hackathons, and system settings across HackSphere.
                    </p>
                </div>
                <button
                    onClick={() => setShowJudgeModal(true)}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-md hover:shadow-lg transition-all"
                >
                    + Create Judge Account
                </button>
            </div>

            {/* Notifications */}
            {message && (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-sm font-medium border border-emerald-200 dark:border-emerald-800/50 shadow-xs flex justify-between items-center">
                    <span>{message}</span>
                    <button onClick={() => setMessage("")} className="text-xs font-bold hover:opacity-75">✕</button>
                </div>
            )}
            {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 text-sm font-medium border border-red-200 dark:border-red-800/50 shadow-xs flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError("")} className="text-xs font-bold hover:opacity-75">✕</button>
                </div>
            )}

            {/* Metrics Overview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Users</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalUsers}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Participants</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.participants}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Organizers</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.organizers}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Judges</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.judges}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs col-span-2 md:col-span-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hackathons</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.totalHackathons}</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab("users")}
                    className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
                        activeTab === "users"
                            ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                    User Management ({users.length})
                </button>
                <button
                    onClick={() => setActiveTab("hackathons")}
                    className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
                        activeTab === "hackathons"
                            ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                    Hackathons Overview ({hackathons.length})
                </button>
            </div>

            {/* Tab 1: User Management */}
            {activeTab === "users" && (
                <div className="space-y-4">
                    {/* Filters & Search */}
                    <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                            {["all", "participant", "organizer", "judge", "admin"].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => { setRoleFilter(r); setUsersPage(1); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                                        roleFilter === r
                                            ? "bg-indigo-600 text-white dark:bg-indigo-500"
                                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setUsersPage(1); }}
                            className="w-full md:w-72 px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-3 px-4">User</th>
                                    <th className="py-3 px-4">Email</th>
                                    <th className="py-3 px-4">Role</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-slate-500 dark:text-slate-400">
                                            No users found matching query.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((u) => (
                                        <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                                                {u.firstName} {u.lastName}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-xs font-mono">
                                                {u.email}
                                            </td>
                                            <td className="py-3 px-4">
                                                {u.role === "admin" ? (
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition-all cursor-pointer"
                                                    >
                                                        <option value="participant">Participant</option>
                                                        <option value="organizer">Organizer</option>
                                                        <option value="judge">Judge</option>
                                                    </select>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {u.isBlocked ? (
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300">
                                                        Blocked
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right space-x-2">
                                                {u.role !== "admin" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggleBlock(u._id)}
                                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                                                u.isBlocked
                                                                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                                                    : "bg-amber-500 text-white hover:bg-amber-600"
                                                            }`}
                                                        >
                                                            {u.isBlocked ? "Unblock" : "Block"}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(u._id, `${u.firstName} ${u.lastName}`)}
                                                            className="px-3 py-1 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-all"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={usersPage}
                        totalPages={usersTotalPages}
                        onPageChange={setUsersPage}
                    />
                </div>
            )}

            {/* Tab 2: Hackathons Management */}
            {activeTab === "hackathons" && (
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        {hackathons.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400 py-8 col-span-2 text-center">No hackathons hosted yet.</p>
                        ) : (
                            paginatedHackathons.map((h) => (
                                <div key={h._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{h.title}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                Organizer: {h.organizer?.firstName} {h.organizer?.lastName} ({h.organizer?.email})
                                            </p>
                                        </div>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                                            {h.mode}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{h.description}</p>

                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <p>Theme: <strong className="text-slate-700 dark:text-slate-200">{h.theme}</strong></p>
                                        <p>Prize: <strong className="text-slate-700 dark:text-slate-200">₹{h.prizePool}</strong></p>
                                        <p>Judges Assigned: <strong className="text-slate-700 dark:text-slate-200">{h.assignedJudges?.length || 0}</strong></p>
                                        <p>Max Team: <strong className="text-slate-700 dark:text-slate-200">{h.maxTeamSize}</strong></p>
                                    </div>

                                    <div className="pt-2 flex justify-end">
                                        <button
                                            onClick={() => handleDeleteHackathon(h._id, h.title)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-all"
                                        >
                                            Delete Hackathon
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <Pagination
                        currentPage={hackathonsPage}
                        totalPages={hackathonsTotalPages}
                        onPageChange={setHackathonsPage}
                    />
                </div>
            )}

            {/* Create Judge Modal */}
            {showJudgeModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-md space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Judge Credentials</h3>
                            <button onClick={() => setShowJudgeModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleCreateJudge} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                                <input
                                    type="text"
                                    required
                                    value={judgeForm.firstName}
                                    onChange={(e) => setJudgeForm({ ...judgeForm, firstName: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    value={judgeForm.lastName}
                                    onChange={(e) => setJudgeForm({ ...judgeForm, lastName: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={judgeForm.email}
                                    onChange={(e) => setJudgeForm({ ...judgeForm, email: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={judgeForm.password}
                                    onChange={(e) => setJudgeForm({ ...judgeForm, password: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowJudgeModal(false)}
                                    className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={judgeLoading}
                                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {judgeLoading ? "Creating..." : "Create Judge"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;