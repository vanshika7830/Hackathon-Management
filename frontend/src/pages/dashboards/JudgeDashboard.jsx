import { useEffect, useState } from "react";
import { getJudgeAssignments, submitReview } from "../../services/reviewService";
import Pagination from "../../components/common/Pagination";
import ImageModal from "../../components/common/ImageModal";

const JudgeDashboard = () => {
    const [submissions, setSubmissions] = useState([]);
    const [filter, setFilter] = useState("all"); // "all" | "pending" | "reviewed"
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [activeSubmission, setActiveSubmission] = useState(null);
    const [scores, setScores] = useState({});
    const [feedback, setFeedback] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const itemsPerPage = 4;
    const criteria = ["Innovation", "Technical Complexity", "UI/UX", "Functionality"];

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const data = await getJudgeAssignments();
            setSubmissions(data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load judge assignments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const openReviewForm = (submission) => {
        setActiveSubmission(submission);
        const initialScores = {};
        criteria.forEach((c) => (initialScores[c] = 5));
        setScores(initialScores);
        setFeedback("");
        setMessage("");
        setError("");
    };

    const handleScoreChange = (criterion, value) => {
        const val = Math.min(10, Math.max(0, Number(value)));
        setScores({ ...scores, [criterion]: val });
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setSubmitting(true);
        try {
            const scoresArray = criteria.map((c) => ({
                criterion: c,
                marksGiven: scores[c] || 0,
            }));

            await submitReview({
                submissionId: activeSubmission._id,
                scores: scoresArray,
                feedback,
            });

            setMessage("Review submitted successfully!");
            setActiveSubmission(null);
            fetchAssignments();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredSubmissions = submissions.filter((s) => {
        if (filter === "pending") return !s.reviewed;
        if (filter === "reviewed") return s.reviewed;
        return true;
    });

    const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
    const paginatedSubmissions = filteredSubmissions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setPage(1);
    };

    const totalScoreCurrent = Object.values(scores).reduce((a, b) => a + Number(b || 0), 0);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Judge Evaluation Portal
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Evaluate assigned hackathon submissions, grade criteria (0-10), and provide constructive feedback.
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

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
                <button
                    onClick={() => handleFilterChange("all")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filter === "all"
                            ? "bg-indigo-600 text-white dark:bg-indigo-500"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                >
                    All Submissions ({submissions.length})
                </button>
                <button
                    onClick={() => handleFilterChange("pending")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filter === "pending"
                            ? "bg-indigo-600 text-white dark:bg-indigo-500"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                >
                    Pending ({submissions.filter((s) => !s.reviewed).length})
                </button>
                <button
                    onClick={() => handleFilterChange("reviewed")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filter === "reviewed"
                            ? "bg-indigo-600 text-white dark:bg-indigo-500"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                >
                    Reviewed ({submissions.filter((s) => s.reviewed).length})
                </button>
            </div>

            {/* Submissions List */}
            {filteredSubmissions.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No assigned submissions matching this filter.</p>
                </div>
            ) : (
                <>
                    <div className="grid gap-4">
                        {paginatedSubmissions.map((s) => (
                            <div key={s._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{s.projectName}</h3>
                                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full">
                                                {s.hackathon?.title}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Team: <strong className="text-slate-700 dark:text-slate-200">{s.team?.teamName}</strong>
                                        </p>
                                    </div>

                                    <div>
                                        {s.reviewed ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-3.5 py-1.5 rounded-full shadow-xs">
                                                ✓ Reviewed
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => openReviewForm(s)}
                                                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all shadow-xs"
                                            >
                                                Evaluate Submission
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Project Overview */}
                                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-2 text-xs text-slate-600 dark:text-slate-300">
                                    <p><strong>Problem:</strong> {s.problemStatement}</p>
                                    <p><strong>Solution:</strong> {s.solution}</p>
                                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 font-semibold text-indigo-600 dark:text-indigo-400">
                                        <a href={s.githubRepo} target="_blank" rel="noreferrer" className="hover:underline">
                                            GitHub Repository →
                                        </a>
                                        {s.liveDemoUrl && (
                                            <a href={s.liveDemoUrl} target="_blank" rel="noreferrer" className="hover:underline">
                                                Live Demo →
                                            </a>
                                        )}
                                    </div>
                                    {s.screenshots && s.screenshots.length > 0 && (
                                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                                            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Screenshots (Click to View):</p>
                                            <div className="flex flex-wrap gap-2">
                                                {s.screenshots.map((url, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={url}
                                                        alt={`Screenshot ${idx + 1}`}
                                                        onClick={() => setPreviewImage(url)}
                                                        className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:scale-105 transition-all"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Evaluation Form Modal/Drawer */}
                                {activeSubmission?._id === s._id && (
                                    <form onSubmit={handleSubmitReview} className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                                            Evaluation Scorecard (Max 10 per criterion)
                                        </h4>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {criteria.map((c) => (
                                                <div key={c} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                                                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                        <span>{c}</span>
                                                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{scores[c] || 0} / 10</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="10"
                                                        value={scores[c] || 0}
                                                        onChange={(e) => handleScoreChange(c, e.target.value)}
                                                        className="w-full accent-indigo-600 cursor-pointer"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-xl text-xs font-bold text-indigo-900 dark:text-indigo-200">
                                            <span>Total Calculated Score:</span>
                                            <span className="text-base">{totalScoreCurrent} / 40 pts</span>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Feedback & Judge Remarks
                                            </label>
                                            <textarea
                                                rows="3"
                                                placeholder="Write constructive notes for the team..."
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setActiveSubmission(null)}
                                                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all disabled:opacity-50"
                                            >
                                                {submitting ? "Submitting Review..." : "Submit Review"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        ))}
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </>
            )}

            {/* Lightbox Popup Image Modal */}
            <ImageModal
                imageUrl={previewImage}
                onClose={() => setPreviewImage(null)}
            />
        </div>
    );
};

export default JudgeDashboard;