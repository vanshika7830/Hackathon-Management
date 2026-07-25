import { useEffect, useState } from "react";
import { getLeaderboard } from "../services/leaderboardService";
import Pagination from "./common/Pagination";

const Leaderboard = ({ hackathonId }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const itemsPerPage = 5;

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await getLeaderboard(hackathonId);
                setLeaderboard(data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load leaderboard");
            } finally {
                setLoading(false);
            }
        };

        if (hackathonId) {
            fetchLeaderboard();
        }
    }, [hackathonId]);

    const totalPages = Math.ceil(leaderboard.length / itemsPerPage);
    const paginatedLeaderboard = leaderboard.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return <p className="text-red-500 dark:text-red-400 text-sm p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">{error}</p>;
    }

    if (leaderboard.length === 0) {
        return (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <p className="text-slate-500 dark:text-slate-400 font-medium">No reviews submitted for this hackathon yet.</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Leaderboard rankings will appear once judges evaluate submissions.</p>
            </div>
        );
    }

    const getRankBadge = (rank) => {
        if (rank === 1) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-xs">
                    1st Place
                </span>
            );
        }
        if (rank === 2) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 shadow-xs">
                    2nd Place
                </span>
            );
        }
        if (rank === 3) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-700/20 text-amber-900 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-600/40 shadow-xs">
                    3rd Place
                </span>
            );
        }
        return <span className="font-semibold text-slate-500 dark:text-slate-400">#{rank}</span>;
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Official Leaderboard
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    {leaderboard.length} Submission{leaderboard.length > 1 ? "s" : ""} Ranked
                </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider">
                            <th className="py-3 px-4">Rank</th>
                            <th className="py-3 px-4">Team</th>
                            <th className="py-3 px-4">Project</th>
                            <th className="py-3 px-4 text-center">Reviews</th>
                            <th className="py-3 px-4 text-right">Avg Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                        {paginatedLeaderboard.map((item) => (
                            <tr
                                key={item.rank}
                                className={`transition-colors hover:bg-indigo-50/50 dark:hover:bg-slate-800/50 ${
                                    item.rank === 1
                                        ? "bg-amber-50/30 dark:bg-amber-950/10"
                                        : item.rank === 2
                                        ? "bg-slate-50/50 dark:bg-slate-800/20"
                                        : ""
                                }`}
                            >
                                <td className="py-3.5 px-4">{getRankBadge(item.rank)}</td>
                                <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                                    {item.teamName}
                                </td>
                                <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                                    {item.projectName}
                                </td>
                                <td className="py-3.5 px-4 text-center text-slate-500 dark:text-slate-400">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                        {item.reviewCount}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400 text-base">
                                    {item.totalScore.toFixed(1)} <span className="text-xs text-slate-400 font-normal">pts</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    );
};

export default Leaderboard;
