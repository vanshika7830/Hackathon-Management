import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
    const { token, user } = useAuth();
    const dashboardPath = user ? `/${user.role}/dashboard` : "/login";

    return (
        <div className="min-h-[90vh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col justify-center items-center px-4 py-16">
            <div className="max-w-4xl text-center space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
                    <span>Next-Gen Hackathon Management</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
                    Organize, Participate, and Judge Hackathons <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">All in One Place</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    Say goodbye to Google Forms, spreadsheet tracking, and chaotic chat groups. HackSphere streamlines team formation, registration approvals, evaluation criteria, and automated real-time leaderboards.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                    <Link
                        to="/hackathons"
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-500/25"
                    >
                        Explore Active Hackathons →
                    </Link>

                    {token ? (
                        <Link
                            to={dashboardPath}
                            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-xs"
                        >
                            Go to My Dashboard
                        </Link>
                    ) : (
                        <Link
                            to="/signup"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-xs"
                        >
                            Create an Account
                        </Link>
                    )}
                </div>

                <div className="grid sm:grid-cols-3 gap-6 pt-16 text-left">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">Seamless Team Building</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Create teams, share invite codes, manage members, and transfer leadership effortlessly.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">Fair Judge Evaluation</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Multi-criteria scoring system for Innovation, UI/UX, Tech Complexity, and Functionality.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">Automated Leaderboards</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Real-time score calculation and rank assignment with clear rank badges.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;