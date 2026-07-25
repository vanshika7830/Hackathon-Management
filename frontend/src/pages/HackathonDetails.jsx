import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getHackathonById } from "../services/hackathonService";
import { createTeam, joinTeam } from "../services/teamService";
import { registerTeam, getMyRegistrations } from "../services/registrationService";
import { createSubmission, updateSubmission, getMySubmission } from "../services/submissionService";
import { uploadMultipleFiles } from "../services/uploadService";
import Leaderboard from "../components/Leaderboard";
import ImageModal from "../components/common/ImageModal";

const HackathonDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();

    const [hackathon, setHackathon] = useState(null);
    const [myTeam, setMyTeam] = useState(null);
    const [myRegistration, setMyRegistration] = useState(null);
    const [mySubmission, setMySubmission] = useState(null);
    const [activeTab, setActiveTab] = useState("overview"); // "overview" | "team" | "submission" | "leaderboard"
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [copiedInvite, setCopiedInvite] = useState(false);
    const [uploadingScreenshots, setUploadingScreenshots] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    // Form states
    const [teamForm, setTeamForm] = useState({ teamName: "" });
    const [joinForm, setJoinForm] = useState({ inviteCode: "" });
    const [isEditingSubmission, setIsEditingSubmission] = useState(false);
    const [submissionForm, setSubmissionForm] = useState({
        projectName: "",
        problemStatement: "",
        solution: "",
        githubRepo: "",
        liveDemoUrl: "",
        techStack: "",
        screenshots: [],
    });

    const handleScreenshotUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setUploadingScreenshots(true);
        try {
            const res = await uploadMultipleFiles(files);
            const urls = res.files ? res.files.map((f) => f.url) : (res.urls || []);
            setSubmissionForm((prev) => ({
                ...prev,
                screenshots: [...(prev.screenshots || []), ...urls],
            }));
            setMessage("Project screenshot images uploaded successfully!");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to upload screenshots");
        } finally {
            setUploadingScreenshots(false);
        }
    };

    const fetchAll = async () => {
        try {
            const hackathonData = await getHackathonById(id);
            setHackathon(hackathonData);

            if (user?.role === "participant") {
                const registrations = await getMyRegistrations();
                const reg = registrations.find((r) => r.hackathon?._id === id);
                setMyRegistration(reg || null);
                if (reg) setMyTeam(reg.team);

                if (reg?.status === "approved") {
                    try {
                        const sub = await getMySubmission(id);
                        setMySubmission(sub);
                        if (sub) {
                            setSubmissionForm({
                                projectName: sub.projectName || "",
                                problemStatement: sub.problemStatement || "",
                                solution: sub.solution || "",
                                githubRepo: sub.githubRepo || "",
                                liveDemoUrl: sub.liveDemoUrl || "",
                                techStack: Array.isArray(sub.techStack) ? sub.techStack.join(", ") : sub.techStack || "",
                            });
                        }
                    } catch {
                        setMySubmission(null);
                    }
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load hackathon details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        try {
            const team = await createTeam({ teamName: teamForm.teamName, hackathonId: id });
            setMyTeam(team);
            setMessage(`Team "${team.teamName}" created! Share invite code: ${team.inviteCode}`);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create team");
        }
    };

    const handleJoinTeam = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        try {
            const res = await joinTeam({ inviteCode: joinForm.inviteCode });
            setMyTeam(res.team);
            setMessage("Joined team successfully!");
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to join team");
        }
    };

    const handleRegister = async () => {
        setError("");
        setMessage("");
        try {
            const reg = await registerTeam({ teamId: myTeam._id, hackathonId: id });
            setMyRegistration(reg.registration || reg);
            setMessage("Team registered successfully! Pending organizer approval.");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to register team");
        }
    };

    const handleSubmissionChange = (e) => {
        setSubmissionForm({ ...submissionForm, [e.target.name]: e.target.value });
    };

    const handleSubmitProject = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        try {
            const payload = {
                ...submissionForm,
                techStack: submissionForm.techStack.split(",").map((t) => t.trim()),
                teamId: myTeam._id,
                hackathonId: id,
            };

            let sub;
            if (mySubmission && isEditingSubmission) {
                sub = await updateSubmission(mySubmission._id, payload);
                setMessage("Project submission updated successfully!");
            } else {
                sub = await createSubmission(payload);
                setMessage("Project submitted successfully!");
            }

            setMySubmission(sub);
            setIsEditingSubmission(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit project");
        }
    };

    const copyInviteCode = () => {
        if (myTeam?.inviteCode) {
            navigator.clipboard.writeText(myTeam.inviteCode);
            setCopiedInvite(true);
            setTimeout(() => setCopiedInvite(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!hackathon) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center">
                <p className="text-red-600 font-semibold">Hackathon not found.</p>
            </div>
        );
    }

    const isRegOpen = hackathon.isRegistrationOpen && new Date() <= new Date(hackathon.registrationDeadline);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
            {/* Banner Header */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                {hackathon.mode}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isRegOpen ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                            }`}>
                                {isRegOpen ? "Registration Open" : "Registration Closed"}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
                            {hackathon.title}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Organized by: <span className="font-semibold text-slate-700 dark:text-slate-200">{hackathon.organizer?.firstName} {hackathon.organizer?.lastName}</span>
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-right min-w-[180px]">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Prize Pool</p>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{hackathon.prizePool}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-4 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                    <div>
                        <p className="text-slate-400">Theme</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{hackathon.theme}</p>
                    </div>
                    <div>
                        <p className="text-slate-400">Max Team Size</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{hackathon.maxTeamSize} Members</p>
                    </div>
                    <div>
                        <p className="text-slate-400">Reg. Deadline</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{new Date(hackathon.registrationDeadline).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-slate-400">Submission End</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{new Date(hackathon.endDate).toLocaleDateString()}</p>
                    </div>
                </div>
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

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab("overview")}
                    className={`py-3 px-5 text-sm font-bold border-b-2 transition-all ${
                        activeTab === "overview"
                            ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    }`}
                >
                    Overview & Details
                </button>
                {user?.role === "participant" && (
                    <button
                        onClick={() => setActiveTab("team")}
                        className={`py-3 px-5 text-sm font-bold border-b-2 transition-all ${
                            activeTab === "team"
                                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        }`}
                    >
                        My Team & Registration
                    </button>
                )}
                {user?.role === "participant" && myRegistration?.status === "approved" && (
                    <button
                        onClick={() => setActiveTab("submission")}
                        className={`py-3 px-5 text-sm font-bold border-b-2 transition-all ${
                            activeTab === "submission"
                                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        }`}
                    >
                        Project Submission
                    </button>
                )}
                <button
                    onClick={() => setActiveTab("leaderboard")}
                    className={`py-3 px-5 text-sm font-bold border-b-2 transition-all ${
                        activeTab === "leaderboard"
                            ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    }`}
                >
                    Leaderboard
                </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === "overview" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">About the Hackathon</h3>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                        {hackathon.description}
                    </p>
                </div>
            )}

            {/* Tab 2: Team & Registration */}
            {activeTab === "team" && user?.role === "participant" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
                    {!myTeam ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Create Team Form */}
                            <form onSubmit={handleCreateTeam} className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                                <h3 className="font-bold text-base text-slate-900 dark:text-white">Create a Team</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Form a new team and invite your peers using a unique invite code.</p>
                                <input
                                    type="text"
                                    placeholder="Enter Team Name"
                                    value={teamForm.teamName}
                                    onChange={(e) => setTeamForm({ teamName: e.target.value })}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-all">
                                    Create Team
                                </button>
                            </form>

                            {/* Join Team Form */}
                            <form onSubmit={handleJoinTeam} className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                                <h3 className="font-bold text-base text-slate-900 dark:text-white">Join Existing Team</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Have an invite code from your team leader? Enter it here.</p>
                                <input
                                    type="text"
                                    placeholder="Enter Invite Code"
                                    value={joinForm.inviteCode}
                                    onChange={(e) => setJoinForm({ inviteCode: e.target.value })}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
                                />
                                <button className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-all">
                                    Join Team
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-indigo-50 dark:bg-indigo-950/40 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-lg text-indigo-950 dark:text-indigo-200">
                                        Team: {myTeam.teamName}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-600 dark:text-slate-300">Invite Code:</span>
                                        <code className="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                                            {myTeam.inviteCode}
                                        </code>
                                        <button
                                            onClick={copyInviteCode}
                                            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                                        >
                                            {copiedInvite ? "Copied! ✓" : "Copy"}
                                        </button>
                                    </div>
                                </div>

                                {!myRegistration && (
                                    <button
                                        onClick={handleRegister}
                                        className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md"
                                    >
                                        Register Team for Hackathon
                                    </button>
                                )}
                            </div>

                            {myRegistration && (
                                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                                    <span>Registration Status:</span>
                                    <span className={`px-3 py-1 rounded-full font-bold capitalize ${
                                        myRegistration.status === "approved"
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                            : myRegistration.status === "rejected"
                                            ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                                    }`}>
                                        {myRegistration.status}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Tab 3: Project Submission */}
            {activeTab === "submission" && user?.role === "participant" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                    {mySubmission && !isEditingSubmission ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{mySubmission.projectName}</h3>
                                    <p className="text-xs text-slate-500 mt-1">Status: <span className="font-bold capitalize text-emerald-600">{mySubmission.status}</span></p>
                                </div>
                                <button
                                    onClick={() => setIsEditingSubmission(true)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Edit Submission
                                </button>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-2 text-xs text-slate-700 dark:text-slate-300">
                                <p><strong>Problem:</strong> {mySubmission.problemStatement}</p>
                                <p><strong>Solution:</strong> {mySubmission.solution}</p>
                                <p><strong>Tech Stack:</strong> {Array.isArray(mySubmission.techStack) ? mySubmission.techStack.join(", ") : mySubmission.techStack}</p>
                                {mySubmission.screenshots && mySubmission.screenshots.length > 0 && (
                                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                                        <p className="font-semibold text-slate-900 dark:text-white mb-2">Project Screenshots (Click to View):</p>
                                        <div className="flex flex-wrap gap-2">
                                            {mySubmission.screenshots.map((url, idx) => (
                                                <img
                                                    key={idx}
                                                    src={url}
                                                    alt={`Screenshot ${idx + 1}`}
                                                    onClick={() => setPreviewImage(url)}
                                                    className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:opacity-90 hover:scale-105 transition-all"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 font-semibold text-indigo-600 dark:text-indigo-400">
                                    <a href={mySubmission.githubRepo} target="_blank" rel="noreferrer" className="underline">View GitHub Repository →</a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitProject} className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {mySubmission ? "Edit Project Submission" : "Submit Your Project"}
                            </h3>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                                <input
                                    type="text"
                                    name="projectName"
                                    required
                                    value={submissionForm.projectName}
                                    onChange={handleSubmissionChange}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Problem Statement</label>
                                <textarea
                                    name="problemStatement"
                                    required
                                    rows="2"
                                    value={submissionForm.problemStatement}
                                    onChange={handleSubmissionChange}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Solution Overview</label>
                                <textarea
                                    name="solution"
                                    required
                                    rows="3"
                                    value={submissionForm.solution}
                                    onChange={handleSubmissionChange}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">GitHub Repo URL</label>
                                    <input
                                        type="url"
                                        name="githubRepo"
                                        required
                                        placeholder="https://github.com/..."
                                        value={submissionForm.githubRepo}
                                        onChange={handleSubmissionChange}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Live Demo URL (Optional)</label>
                                    <input
                                        type="url"
                                        name="liveDemoUrl"
                                        placeholder="https://..."
                                        value={submissionForm.liveDemoUrl}
                                        onChange={handleSubmissionChange}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tech Stack (comma separated)</label>
                                <input
                                    type="text"
                                    name="techStack"
                                    placeholder="React, Node.js, MongoDB, Tailwind"
                                    value={submissionForm.techStack}
                                    onChange={handleSubmissionChange}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Project Screenshots / Diagrams (Upload Images)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleScreenshotUpload}
                                    className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                />
                                {uploadingScreenshots && <p className="text-xs text-indigo-600 mt-1 animate-pulse">Uploading images...</p>}
                                {submissionForm.screenshots && submissionForm.screenshots.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {submissionForm.screenshots.map((url, idx) => (
                                            <img
                                                key={idx}
                                                src={url}
                                                alt={`Screenshot ${idx + 1}`}
                                                onClick={() => setPreviewImage(url)}
                                                className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:opacity-90 hover:scale-105 transition-all"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                {isEditingSubmission && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingSubmission(false)}
                                        className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md"
                                >
                                    {mySubmission ? "Update Project" : "Submit Project"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Tab 4: Leaderboard */}
            {activeTab === "leaderboard" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                    <Leaderboard hackathonId={id} />
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

export default HackathonDetails;