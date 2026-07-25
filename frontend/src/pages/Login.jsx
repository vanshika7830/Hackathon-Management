import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi } from "../services/authServices";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await loginApi(formData);
            login(data, data.token);

            if (data.role === "admin") navigate("/admin/dashboard");
            else if (data.role === "organizer") navigate("/organizer/dashboard");
            else if (data.role === "judge") navigate("/judge/dashboard");
            else navigate("/participant/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950 transition-colors">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md space-y-6">
                <div className="text-center space-y-1">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Welcome Back</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Log in to manage hackathons, teams, and submissions
                    </p>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800">
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
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                                Password
                            </label>
                            <Link to="/forgot-password" className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all shadow-md disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Don't have an account?{" "}
                        <Link to="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;