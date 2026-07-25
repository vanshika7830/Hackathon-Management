import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    getAllHackathons,
    createHackathon,
    updateHackathon,
    deleteHackathon,
    assignJudge,
} from "../../services/hackathonService";
import {
    getHackathonRegistrations,
    approveRegistration,
    rejectRegistration,
} from "../../services/registrationService";
import { getSubmissionsByHackathon } from "../../services/submissionService";
import { getUsersByRole } from "../../services/userService";
import { uploadSingleFile } from "../../services/uploadService";
import Leaderboard from "../../components/Leaderboard";
import Pagination from "../../components/common/Pagination";
import ImageModal from "../../components/common/ImageModal";

const OrganizerDashboard = () => {
    const { user } = useAuth();
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [bannerUploading, setBannerUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    
    const [hackathonsPage, setHackathonsPage] = useState(1);
    const [regsPage, setRegsPage] = useState(1);
    const [subsPage, setSubsPage] = useState(1);

    const hackathonsPerPage = 3;
    const regsPerPage = 5;
    const subsPerPage = 4;
    const [showForm, setShowForm] = useState(false);
    const [editingHackathon, setEditingHackathon] = useState(null);
    const [form, setForm] = useState({
        title: "", description: "", theme: "", mode: "Online",
        startDate: "", endDate: "", registrationDeadline: "",
        prizePool: "", maxTeamSize: "",
    });

    // Expanded hackathon state
    const [expandedId, setExpandedId] = useState(null);
    const [activeTab, setActiveTab] = useState("registrations"); // "registrations" | "submissions" | "leaderboard"
    const [registrations, setRegistrations] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [judges, setJudges] = useState([]);
    const [selectedJudge, setSelectedJudge] = useState("");

    const fetchHackathons = async () => {
        try {
            const mine = await getAllHackathons(user._id);
            setHackathons(mine);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load hackathons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHackathons();
    }, []);

    const handleBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setBannerUploading(true);
        try {
            const res = await uploadSingleFile(file);
            const url = res.url || res.file?.url;
            setForm((prev) => ({ ...prev, bannerImage: url }));
            setMessage("Banner image uploaded successfully!");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to upload banner image");
        } finally {
            setBannerUploading(false);
        }
    };

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const openCreateForm = () => {
        setEditingHackathon(null);
        setForm({
            title: "", description: "", theme: "", mode: "Online",
            startDate: "", endDate: "", registrationDeadline: "",
            prizePool: "", maxTeamSize: "",
        });
        setShowForm(true);
    };

    const openEditForm = (h) => {
        setEditingHackathon(h);
        setForm({
            title: h.title,
            description: h.description,
            theme: h.theme,
            mode: h.mode,
            startDate: h.startDate ? new Date(h.startDate).toISOString().split("T")[0] : "",
            endDate: h.endDate ? new Date(h.endDate).toISOString().split("T")[0] : "",
            registrationDeadline: h.registrationDeadline ? new Date(h.registrationDeadline).toISOString().split("T")[0] : "",
            prizePool: h.prizePool || "",
            maxTeamSize: h.maxTeamSize || "",
        });
        setShowForm(true);
    };

    const handleSaveHackathon = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        try {
            const payload = {
                ...form,
                prizePool: Number(form.prizePool),
                maxTeamSize: Number(form.maxTeamSize),
            };

            if (editingHackathon) {
                await updateHackathon(editingHackathon._id, payload);
                setMessage("Hackathon updated successfully!");
            } else {
                await createHackathon(payload);
                setMessage("Hackathon created successfully!");
            }

            setShowForm(false);
            setEditingHackathon(null);
            fetchHackathons();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save hackathon");
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
        try {
            setError("");
            setMessage("");
            await deleteHackathon(id);
            setMessage("Hackathon deleted successfully.");
            setHackathons(hackathons.filter((h) => h._id !== id));
            if (expandedId === id) setExpandedId(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete hackathon");
        }
    };

    const handleExpand = async (hackathonId) => {
        if (expandedId === hackathonId) {
            setExpandedId(null);
            return;
        }
        setExpandedId(hackathonId);
        setActiveTab("registrations");
        setRegsPage(1);
        setSubsPage(1);
        setError("");
        try {
            const [regs, subs, judgeList] = await Promise.all([
                getHackathonRegistrations(hackathonId),
                getSubmissionsByHackathon(hackathonId),
                getUsersByRole("judge"),
            ]);
            setRegistrations(regs);
            setSubmissions(subs);
            setJudges(judgeList);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load hackathon management details");
        }
    };

    const handleApprove = async (regId, hackathonId) => {
        try {
            await approveRegistration(regId);
            setMessage("Registration approved");
            const regs = await getHackathonRegistrations(hackathonId);
            setRegistrations(regs);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to approve");
        }
    };

    const handleReject = async (regId, hackathonId) => {
        try {
            await rejectRegistration(regId);
            setMessage("Registration rejected");
            const regs = await getHackathonRegistrations(hackathonId);
            setRegistrations(regs);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reject");
        }
    };

    const handleAssignJudge = async (hackathonId) => {
        if (!selectedJudge) return;
        try {
            await assignJudge(hackathonId, selectedJudge);
            setMessage("Judge assigned successfully!");
            setSelectedJudge("");
            fetchHackathons();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to assign judge");
        }
    };

    const hackathonsTotalPages = Math.ceil(hackathons.length / hackathonsPerPage);
    const paginatedHackathons = hackathons.slice((hackathonsPage - 1) * hackathonsPerPage, hackathonsPage * hackathonsPerPage);

    const regsTotalPages = Math.ceil(registrations.length / regsPerPage);
    const paginatedRegs = registrations.slice((regsPage - 1) * regsPerPage, regsPage * regsPerPage);

    const subsTotalPages = Math.ceil(submissions.length / subsPerPage);
    const paginatedSubs = submissions.slice((subsPage - 1) * subsPerPage, subsPage * subsPerPage);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Organizer Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Create hackathons, approve team registrations, assign judges, and view results.
                    </p>
                </div>
                <button
                    onClick={openCreateForm}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-md hover:shadow-lg transition-all"
                >
                    + Host New Hackathon
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

            {/* Create/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {editingHackathon ? "Edit Hackathon" : "Create New Hackathon"}
                            </h3>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleSaveHackathon} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                <input
                                    name="title"
                                    required
                                    placeholder="e.g. AI Innovation Summit 2026"
                                    value={form.title}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    required
                                    rows="3"
                                    placeholder="Detailed overview of the hackathon..."
                                    value={form.description}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Theme / Domain</label>
                                    <input
                                        name="theme"
                                        required
                                        placeholder="e.g. Web3, AI, FinTech"
                                        value={form.theme}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mode</label>
                                    <select
                                        name="mode"
                                        value={form.mode}
                                        onChange={handleFormChange}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition-all cursor-pointer"
                                    >
                                        <option value="Online">Online</option>
                                        <option value="Offline">Offline</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        required
                                        value={form.startDate}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        required
                                        value={form.endDate}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Reg. Deadline</label>
                                    <input
                                        type="date"
                                        name="registrationDeadline"
                                        required
                                        value={form.registrationDeadline}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Prize Pool (₹)</label>
                                    <input
                                        type="number"
                                        name="prizePool"
                                        placeholder="50000"
                                        value={form.prizePool}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Max Team Size</label>
                                    <input
                                        type="number"
                                        name="maxTeamSize"
                                        required
                                        placeholder="4"
                                        value={form.maxTeamSize}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Banner Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBannerUpload}
                                    className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                />
                                {bannerUploading && <p className="text-xs text-indigo-600 mt-1 animate-pulse">Uploading banner...</p>}
                                {form.bannerImage && (
                                    <img
                                        src={form.bannerImage}
                                        alt="Banner preview"
                                        onClick={() => setPreviewImage(form.bannerImage)}
                                        className="w-full h-24 object-cover rounded-lg mt-2 border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90 hover:scale-[1.01] transition-all"
                                    />
                                )}
                            </div>

                            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                    {editingHackathon ? "Update Hackathon" : "Create Hackathon"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List of Organizer's Hackathons */}
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Managed Hackathons</h2>
            {hackathons.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400 font-medium">You haven't created any hackathons yet.</p>
                    <button
                        onClick={openCreateForm}
                        className="mt-3 inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Create Your First Hackathon
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {paginatedHackathons.map((h) => (
                        <div key={h._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                            {/* Card Header */}
                            <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-xl text-slate-900 dark:text-white">{h.title}</h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                            {h.mode}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Theme: <span className="font-medium text-slate-700 dark:text-slate-200">{h.theme}</span> · Prize: <span className="font-medium text-slate-700 dark:text-slate-200">₹{h.prizePool}</span> · Max Team: <span className="font-medium text-slate-700 dark:text-slate-200">{h.maxTeamSize}</span>
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditForm(h)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(h._id, h.title)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 hover:bg-red-100 transition-all"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => handleExpand(h._id)}
                                        className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
                                    >
                                        {expandedId === h._id ? "Hide Panel" : "Manage"}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Panel */}
                            {expandedId === h._id && (
                                <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 space-y-6">
                                    {/* Assign Judge Section */}
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-sm-center justify-between gap-3">
                                        <div className="text-xs text-slate-600 dark:text-slate-400">
                                            <span className="font-bold text-slate-900 dark:text-white">Assigned Judges: </span>
                                            {h.assignedJudges?.length || 0} judges currently assigned to this hackathon.
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={selectedJudge}
                                                onChange={(e) => setSelectedJudge(e.target.value)}
                                                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition-all cursor-pointer"
                                            >
                                                <option value="">-- Select a judge to assign --</option>
                                                {judges.map((j) => (
                                                    <option key={j._id} value={j._id}>
                                                        {j.firstName} {j.lastName} ({j.email})
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleAssignJudge(h._id)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all whitespace-nowrap"
                                            >
                                                Assign Judge
                                            </button>
                                        </div>
                                    </div>

                                    {/* Management Tabs */}
                                    <div className="flex border-b border-slate-200 dark:border-slate-800">
                                        <button
                                            onClick={() => { setActiveTab("registrations"); setRegsPage(1); }}
                                            className={`py-2 px-4 text-xs font-bold border-b-2 transition-all ${
                                                activeTab === "registrations"
                                                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                                                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                                            }`}
                                        >
                                            Registrations ({registrations.length})
                                        </button>
                                        <button
                                            onClick={() => { setActiveTab("submissions"); setSubsPage(1); }}
                                            className={`py-2 px-4 text-xs font-bold border-b-2 transition-all ${
                                                activeTab === "submissions"
                                                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                                                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                                            }`}
                                        >
                                            Submissions ({submissions.length})
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("leaderboard")}
                                            className={`py-2 px-4 text-xs font-bold border-b-2 transition-all ${
                                                activeTab === "leaderboard"
                                                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                                                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                                            }`}
                                        >
                                            Leaderboard
                                        </button>
                                    </div>

                                    {/* Registrations View */}
                                    {activeTab === "registrations" && (
                                        <div className="space-y-3">
                                            {registrations.length === 0 ? (
                                                <p className="text-xs text-slate-500 dark:text-slate-400">No teams registered yet.</p>
                                            ) : (
                                                <>
                                                    <div className="grid gap-2">
                                                        {paginatedRegs.map((reg) => (
                                                            <div key={reg._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex justify-between items-center shadow-xs">
                                                                <div>
                                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{reg.team?.teamName}</h4>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                        Leader: {reg.registeredBy?.firstName} {reg.registeredBy?.lastName} ({reg.registeredBy?.email})
                                                                    </p>
                                                                    <p className="text-xs text-slate-400 mt-1">
                                                                        Members: {reg.team?.members?.map((m) => `${m.firstName} ${m.lastName}`).join(", ")}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    {reg.status === "pending" ? (
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => handleApprove(reg._id, h._id)}
                                                                                className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                                                                            >
                                                                                Approve
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleReject(reg._id, h._id)}
                                                                                className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
                                                                            >
                                                                                Reject
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                                                                            reg.status === "approved"
                                                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                                                                : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                                                                        }`}>
                                                                            {reg.status}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <Pagination
                                                        currentPage={regsPage}
                                                        totalPages={regsTotalPages}
                                                        onPageChange={setRegsPage}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Submissions View */}
                                    {activeTab === "submissions" && (
                                        <div className="space-y-3">
                                            {submissions.length === 0 ? (
                                                <p className="text-xs text-slate-500 dark:text-slate-400">No project submissions yet.</p>
                                            ) : (
                                                <>
                                                    <div className="grid md:grid-cols-2 gap-3">
                                                        {paginatedSubs.map((sub) => (
                                                            <div key={sub._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-2">
                                                                <div className="flex justify-between items-start">
                                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{sub.projectName}</h4>
                                                                    <span className="text-xs text-slate-500 font-medium">Team: {sub.team?.teamName}</span>
                                                                </div>
                                                                <p className="text-xs text-slate-600 dark:text-slate-300">{sub.problemStatement}</p>
                                                                <div className="text-xs space-y-1 text-indigo-600 dark:text-indigo-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                                                                    <p>GitHub: <a href={sub.githubRepo} target="_blank" rel="noreferrer" className="underline">{sub.githubRepo}</a></p>
                                                                    {sub.liveDemoUrl && <p>Demo: <a href={sub.liveDemoUrl} target="_blank" rel="noreferrer" className="underline">{sub.liveDemoUrl}</a></p>}
                                                                </div>
                                                                {sub.screenshots && sub.screenshots.length > 0 && (
                                                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                                                        {sub.screenshots.map((url, idx) => (
                                                                            <img
                                                                                key={idx}
                                                                                src={url}
                                                                                alt={`Screenshot ${idx + 1}`}
                                                                                onClick={() => setPreviewImage(url)}
                                                                                className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:scale-105 transition-all"
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <Pagination
                                                        currentPage={subsPage}
                                                        totalPages={subsTotalPages}
                                                        onPageChange={setSubsPage}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Leaderboard View */}
                                    {activeTab === "leaderboard" && (
                                        <Leaderboard hackathonId={h._id} />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    <Pagination
                        currentPage={hackathonsPage}
                        totalPages={hackathonsTotalPages}
                        onPageChange={setHackathonsPage}
                    />
                </div>
            )}

            {/* Lightbox Popup Image Modal */}
            <ImageModal
                imageUrl={previewImage}
                onClose={() => setPreviewImage(null)}
            />
        </div>
    );
};

export default OrganizerDashboard;