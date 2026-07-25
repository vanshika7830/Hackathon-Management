import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllHackathons } from "../services/hackathonService";
import Pagination from "../components/common/Pagination";

const HackathonListing = () => {
    const [hackathons, setHackathons] = useState([]);
    const [search, setSearch] = useState("");
    const [modeFilter, setModeFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const itemsPerPage = 4;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAllHackathons();
                setHackathons(data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load hackathons");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filtered = hackathons.filter((h) => {
        const matchesMode = modeFilter === "all" || h.mode?.toLowerCase() === modeFilter.toLowerCase();
        const matchesSearch =
            h.title?.toLowerCase().includes(search.toLowerCase()) ||
            h.theme?.toLowerCase().includes(search.toLowerCase()) ||
            h.description?.toLowerCase().includes(search.toLowerCase());
        return matchesMode && matchesSearch;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedHackathons = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleModeChange = (e) => {
        setModeFilter(e.target.value);
        setPage(1);
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <p className="p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 text-sm font-medium border border-red-200 dark:border-red-800">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Browse Hackathons
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Discover top developer hackathons, register teams, and win cash prizes.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Search hackathons, themes..."
                        value={search}
                        onChange={handleSearchChange}
                        className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                    />
                    <select
                        value={modeFilter}
                        onChange={handleModeChange}
                        className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition-all cursor-pointer"
                    >
                        <option value="all">All Modes</option>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                    </select>
                </div>
            </div>

            {/* Hackathon Cards Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No hackathons found matching your search criteria.</p>
                </div>
            ) : (
                <>
                    <div className="grid md:grid-cols-2 gap-6">
                        {paginatedHackathons.map((h) => (
                            <div
                                key={h._id}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                            >
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {h.title}
                                        </h3>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                            {h.mode}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        Theme: <span className="text-slate-700 dark:text-slate-200">{h.theme}</span>
                                    </p>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                                        {h.description}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                    <div className="grid grid-cols-2 text-xs text-slate-500 dark:text-slate-400">
                                        <div>
                                            <p className="text-[11px] text-slate-400">Prize Pool</p>
                                            <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">₹{h.prizePool}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] text-slate-400">Max Team Size</p>
                                            <p className="font-bold text-slate-700 dark:text-slate-200">{h.maxTeamSize} Members</p>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/hackathons/${h._id}`}
                                        className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-center text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all shadow-xs block"
                                    >
                                        View Details & Register →
                                    </Link>
                                </div>
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
        </div>
    );
};

export default HackathonListing;