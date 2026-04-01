import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user?.full_name || "",
        phone: user?.phone || "",
        bio: user?.bio || "",
        profilePic: user?.profilePic || "",
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate("/signin");
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                "http://localhost:5000/api/auth/profile",
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.success) {
                updateProfile(formData);
                setIsEditing(false);
                setMessage("Profile updated successfully!");
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (err) {
            setMessage("Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="section-container mt-12 mb-24">
            <div className="max-w-4xl mx-auto glass-panel-dark overflow-hidden p-0 shadow-2xl border border-white/10 transition-all duration-500 animate-fade-in">
                {/* Profile Header Block */}
                <div className="bg-gradient-to-r from-brand-600/10 to-accent-600/10 p-10 flex flex-col items-center md:flex-row md:items-start gap-8 border-b border-white/5 shadow-inner">
                    <div className="relative group/avatar">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-brand-500/50 to-emerald-500/50 blur opacity-75 group-hover/avatar:opacity-100 transition-opacity"></div>
                        <img
                            src={user.profilePic}
                            alt={user.username}
                            className="w-32 h-32 rounded-full object-cover border-4 border-white/20 relative animate-float shadow-2xl transition-transform hover:scale-110 duration-700"
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h2 className="text-4xl font-display font-black text-slate-900 dark:text-white capitalize">
                                    {user.full_name || user.username}
                                </h2>
                                <div className="mt-2 flex items-center justify-center md:justify-start gap-4">
                                    <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-widest border border-brand-500/20">
                                        ID: {user.username}
                                    </span>
                                    <span className="text-sm font-mono text-slate-500 dark:text-white/40">
                                        Network Member since {new Date(user.createdAt).getFullYear()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="btn-secondary !py-2 !px-5 !text-xs !bg-white/5 hover:!bg-white/10 font-bold uppercase tracking-widest"
                                >
                                    {isEditing ? "Quit Editor" : "Modify Profile"}
                                </button>
                                <button
                                    onClick={logout}
                                    className="px-5 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500/20 transition-all duration-300"
                                >
                                    Terminate Session
                                </button>
                            </div>
                        </div>

                        <p className="text-lg text-slate-600 dark:text-slate-400/80 leading-relaxed italic max-w-xl mx-auto md:mx-0">
                            "{user.bio}"
                        </p>
                    </div>
                </div>

                {/* Dynamic Form / View Area */}
                <div className="p-8 md:p-12">
                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 mb-3 block">Display Name</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 mb-3 block">Communications Line (Phone)</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="Global comms ID"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 mb-3 block">Avatar Link (URL)</label>
                                    <input
                                        type="text"
                                        name="profilePic"
                                        value={formData.profilePic}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="Image source endpoint"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6 flex flex-col h-full">
                                <div className="flex-1 min-h-[140px]">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 mb-3 block">Trader Bio-Data</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="input-field h-full resize-none leading-relaxed"
                                        placeholder="Describe your trading philosophy..."
                                    />
                                </div>

                                <div className="pt-4 flex flex-col gap-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-gradient w-full py-4 text-base font-bold shadow-2xl shadow-brand-500/30 tracking-[0.1em] uppercase"
                                    >
                                        {loading ? "Writing to Network..." : "Synchronize Profile"}
                                    </button>
                                    {message && (
                                        <p className="text-center text-sm font-bold text-emerald-500 animate-pulse">{message}</p>
                                    )}
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                            <div className="space-y-2 p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/20">Authorized Account</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{user.email}</p>
                            </div>
                            <div className="space-y-2 p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/20">Communication Sync</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{user.phone || "Not Configured"}</p>
                            </div>
                            <div className="space-y-2 p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/20">Profile Completeness</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                        <div className="h-full bg-brand-500 w-[75%]" />
                                    </div>
                                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">75%</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
