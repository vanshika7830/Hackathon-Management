import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllHackathons } from "../../services/hackathonService";
import { getMyRegistrations, cancelRegistration } from "../../services/registrationService";
import { joinTeam, leaveTeam, removeMember, transferLeadership, deleteTeam } from "../../services/teamService";
import { getAllUsers } from "../../services/userService";
import { Link } from "react-router-dom";
import Pagination from "../../components/common/Pagination";

const ParticipantDashboard = () => {
    const { user } = useAuth();
    const [hackathons, setHackathons] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [usersMap, setUsersMap] = useState({});
    const [usersEmailMap, setUsersEmailMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [showJoinModal, setShowJoinModal] = useState(false);
    const [inviteCodeInput, setInviteCodeInput] = useState("");

    const [regPage, setRegPage] = useState(1);
    const [explorePage, setExplorePage] = useState(1);
    const regPerPage = 3;
    const explorePerPage = 4;

    const [selectedTeam, setSelectedTeam] = useState(null);
    const [newLeaderId, setNewLeaderId] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const [hackathonsData, registrationsData, usersData] = await Promise.all([
                getAllHackathons(),
                getMyRegistrations(),
                getAllUsers().catch(() => []),
            ]);

            const nameMap = {};
            const emailMap = {};
            if (Array.isArray(usersData)) {
                usersData.forEach((u) => {
                    nameMap[u._id] = `${u.firstName} ${u.lastName}`;
                    emailMap[u._id] = u.email;
                });
            }
            setUsersMap(nameMap);
            setUsersEmailMap(emailMap);
            setHackathons(hackathonsData);
            setRegistrations(registrationsData);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load participant dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleJoinTeamWithCode = async (e) => {
        e.preventDefault();
        if (!inviteCodeInput) return;
        try {
            setError("");
            setMessage("");
            const res = await joinTeam(inviteCodeInput.trim().toUpperCase());
            setMessage(res.message || "Successfully joined team!");
            setInviteCodeInput("");
            setShowJoinModal(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to join team. Check invite code.");
        }
    };

    const handleCancelRegistration = async (regId) => {
        if (!window.confirm("Are you sure you want to cancel this team registration?")) return;
        try {
            setError("");
            setMessage("");
            await cancelRegistration(regId);
            setMessage("Registration cancelled successfully.");
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to cancel registration");
        }
    };

    const handleLeaveTeam = async (teamId) => {
        if (!window.confirm("Are you sure you want to leave this team?")) return;
        try {
            setError("");
            setMessage("");
            await leaveTeam(teamId);
            setMessage("You have left the team.");
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to leave team");
        }
    };

    const handleRemoveMember = async (teamId, memberId, memberName) => {
        if (!window.confirm(`Remove ${memberName} from team?`)) return;
        try {
            setError("");
            setMessage("");
            await removeMember(teamId, memberId);
            setMessage(`Member ${memberName} removed.`);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to remove member");
        }
    };

    const handleTransferLeadership = async (teamId) => {
        if (!newLeaderId) return;
        try {
            setError("");
            setMessage("");
            await transferLeadership(teamId, newLeaderId);
            setMessage("Leadership transferred successfully!");
            setSelectedTeam(null);
            setNewLeaderId("");
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to transfer leadership");
        }
    };

    const handleDeleteTeam = async (teamId, teamName) => {
        if (!window.confirm(`Delete team "${teamName}"? This action cannot be undone.`)) return;
        try {
            setError("");
            setMessage("");
            await deleteTeam(teamId);
            setMessage(`Team "${teamName}" deleted.`);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete team");
        }
    };

    const regTotalPages = Math.ceil(registrations.length / regPerPage);
    const paginatedRegistrations = registrations.slice((regPage - 1) * regPerPage, regPage * regPerPage);

    const exploreTotalPages = Math.ceil(hackathons.length / explorePerPage);
    const paginatedHackathons = hackathons.slice((explorePage - 1) * explorePerPage, explorePage * explorePerPage);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Participant Hub
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Welcome back, <strong className="text-slate-700 dark:text-slate-200">{user?.firstName} {user?.lastName}</strong>! Manage your teams, track registrations, and submit projects.
                </p>
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

            <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        My Hackathon Registrations & Teams
                    </h2>
                    <button
                        onClick={() => setShowJoinModal(true)}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all shadow-xs"
                    >
                        Join Team via Code
                    </button>
                </div>

                {registrations.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">You haven't registered for any hackathons yet.</p>
                        <p className="text-xs text-slate-400 mt-1">Browse open hackathons below and form a team to get started!</p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4">
                            {paginatedRegistrations.map((reg) => {
                                const team = reg.team;
                                const isLeader = team?.leader === user?._id || team?.leader?._id === user?._id;

                                return (
                                    <div key={reg._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                        {reg.hackathon?.title}
                                                    </h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                                        reg.status === "approved"
                                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                                            : reg.status === "rejected"
                                                            ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                                                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                                                    }`}>
                                                        Status: {reg.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    Team Name: <strong className="text-slate-700 dark:text-slate-200">{team?.teamName}</strong> · Invite Code: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-indigo-600 dark:text-indigo-400 font-bold">{team?.inviteCode}</code>
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/hackathons/${reg.hackathon?._id}`}
                                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs"
                                                >
                                                    Go to Hackathon Page →
                                                </Link>
                                                {reg.status === "pending" && isLeader && (
                                                    <button
                                                        onClick={() => handleCancelRegistration(reg._id)}
                                                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 hover:bg-red-100 transition-all"
                                                    >
                                                        Cancel Registration
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Team Details & Actions */}
                                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-3">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    Team Roster ({team?.members?.length || 0} Members)
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    {!isLeader && (
                                                        <button
                                                            onClick={() => handleLeaveTeam(team._id)}
                                                            className="text-xs font-semibold text-red-600 hover:underline"
                                                        >
                                                            Leave Team
                                                        </button>
                                                    )}
                                                    {isLeader && (
                                                        <>
                                                            <button
                                                                onClick={() => setSelectedTeam(team)}
                                                                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                                            >
                                                                Transfer Leadership
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteTeam(team._id, team.teamName)}
                                                                className="text-xs font-semibold text-red-600 hover:underline"
                                                            >
                                                                Delete Team
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                                {team?.members?.map((m) => {
                                                    const isObj = typeof m === "object" && m !== null;
                                                    const memberId = isObj ? m._id : m;
                                                    const memberName = isObj && m.firstName
                                                        ? `${m.firstName} ${m.lastName}`
                                                        : (usersMap[memberId] || "Participant");
                                                    const memberEmail = isObj && m.email
                                                        ? m.email
                                                        : (usersEmailMap[memberId] || "");
                                                    const leaderId = typeof team?.leader === "object" && team?.leader !== null ? team.leader._id : team?.leader;
                                                    const isMemberLeader = String(memberId) === String(leaderId);

                                                    return (
                                                        <div key={memberId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg flex justify-between items-center shadow-xs">
                                                            <div>
                                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                                    {memberName} {isMemberLeader && <span className="text-amber-500 font-bold ml-1">(Leader)</span>}
                                                                </p>
                                                                {memberEmail && <p className="text-slate-400 text-[11px]">{memberEmail}</p>}
                                                            </div>
                                                            {isLeader && !isMemberLeader && (
                                                                <button
                                                                    onClick={() => handleRemoveMember(team._id, memberId, memberName)}
                                                                    className="text-red-500 hover:text-red-700 font-bold text-xs"
                                                                    title="Remove Member"
                                                                >
                                                                    ✕
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Pagination
                            currentPage={regPage}
                            totalPages={regTotalPages}
                            onPageChange={setRegPage}
                        />
                    </>
                )}
            </section>

            {/* Explore Open Hackathons */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Explore Active Hackathons
                </h2>
                {hackathons.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No active hackathons found right now.</p>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 gap-4">
                            {paginatedHackathons.map((h) => (
                                <div key={h._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{h.title}</h3>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                                                {h.mode}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{h.theme}</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">{h.description}</p>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">Prize Pool: ₹{h.prizePool}</span>
                                        <Link
                                            to={`/hackathons/${h._id}`}
                                            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                        >
                                            View Details →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination
                            currentPage={explorePage}
                            totalPages={exploreTotalPages}
                            onPageChange={setExplorePage}
                        />
                    </>
                )}
            </section>

            {/* Transfer Leadership Modal */}
            {selectedTeam && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-md space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transfer Team Leadership</h3>
                            <button onClick={() => setSelectedTeam(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300">
                            Select a member of team <strong>{selectedTeam.teamName}</strong> to become the new leader.
                        </p>

                        <select
                            value={newLeaderId}
                            onChange={(e) => setNewLeaderId(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition-all cursor-pointer"
                        >
                            <option value="">-- Select New Leader --</option>
                            {selectedTeam?.members
                                ?.filter((m) => (typeof m === "object" && m !== null ? m._id : m) !== user?._id)
                                .map((m) => {
                                    const id = typeof m === "object" && m !== null ? m._id : m;
                                    const name = typeof m === "object" && m !== null && m.firstName
                                        ? `${m.firstName} ${m.lastName}`
                                        : (usersMap[id] || "Participant");
                                    return (
                                        <option key={id} value={id}>
                                            {name}
                                        </option>
                                    );
                                })}
                        </select>

                        <div className="pt-2 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedTeam(null)}
                                className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleTransferLeadership(selectedTeam._id)}
                                disabled={!newLeaderId}
                                className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Confirm Transfer
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Join Team via Invite Code Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-md space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Join Team with Invite Code</h3>
                            <button onClick={() => setShowJoinModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleJoinTeamWithCode} className="space-y-4">
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                Enter the 6-character team invite code shared by your team leader.
                            </p>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Invite Code</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. NEURAL1"
                                    value={inviteCodeInput}
                                    onChange={(e) => setInviteCodeInput(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowJoinModal(false)}
                                    className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                                >
                                    Join Team
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParticipantDashboard;