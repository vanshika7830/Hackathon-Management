import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authServices";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const data = await forgotPassword(email);
            setMessage(data.message || "Password reset link sent to your email!");
            setEmail("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950 transition-colors">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot Password</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Enter your account email to receive a password reset link.
                    </p>
                </div>

                {message && (
                    <div className="p-3 mb-4 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800/50">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800/50">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-sm transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                        {loading ? "Sending link..." : "Send Reset Link"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
