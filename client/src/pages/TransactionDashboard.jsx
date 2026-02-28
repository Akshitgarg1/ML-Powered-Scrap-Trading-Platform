import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getEscrowDetails, getProduct } from "../services/api";
import {
    EscrowStatusBadge,
    EscrowProgressTracker,
    EscrowActionPanel,
    EscrowAuditLog
} from "../components/escrow/EscrowComponents";
import { formatPrice } from "../utils/formatPrice";

/**
 * TransactionDashboard: Main Secure Escrow Portal for individual orders.
 */
const TransactionDashboard = () => {
    const { escrowId } = useParams();
    const [escrow, setEscrow] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // MOCK USER SESSIONS (Simplified for Integration)
    const currentUserId = localStorage.getItem("escrow_user_id") || "demo_buyer";
    const currentUserRole = localStorage.getItem("escrow_user_role") || "BUYER";

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Polling for updates
        return () => clearInterval(interval);
    }, [escrowId]);

    const fetchData = async () => {
        try {
            const res = await getEscrowDetails(escrowId);
            if (res.success) {
                setEscrow(res.escrow);
                // Load product info
                const prodRes = await getProduct(res.escrow.product_id);
                if (prodRes.success) setProduct(prodRes.product);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
        </div>
    );

    if (error || !escrow) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Escrow Protocol Timeout</h2>
            <p className="text-slate-500 max-w-sm">The requested ledger ID could not be loaded. This link may have expired or you may not have authorization.</p>
            <Link to="/browse" className="btn-secondary mt-8">Return to Marketplace</Link>
        </div>
    );

    return (
        <div className="min-h-screen py-16 px-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
            <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">

                {/* Header: Core Details & Status */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white dark:bg-slate-900/50 p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[100px] pointer-events-none -z-10 rounded-full -mt-20 -mr-20"></div>

                    <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-600 dark:text-brand-400">Secure Protocol ID:</span>
                            <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded font-mono text-xs text-slate-400">{escrow.escrow_id}</kbd>
                            <EscrowStatusBadge status={escrow.status_matrix.escrow_status} />
                        </div>
                        <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white">
                            {product?.title || "Asset Transaction"}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                            This transaction is being mediated by an automated Escrow Smart Agent.
                            Funds are secured until delivery is confirmed by the buyer.
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-100 dark:border-white/5 text-right space-y-2 min-w-[220px]">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Value Held in Escrow</p>
                        <p className="text-4xl font-display font-bold text-slate-900 dark:text-white">
                            {formatPrice(escrow.ledger.amount)}
                        </p>
                        <div className="flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {escrow.status_matrix.payment_status}
                        </div>
                    </div>
                </div>

                {/* Transaction Map: Progress Tracker */}
                <div className="glass-panel p-10 space-y-12">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6 mb-10">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Escrow Progression Protocol</h3>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                            Step-by-Step Immutability
                        </div>
                    </div>
                    <EscrowProgressTracker currentStatus={escrow.status_matrix.escrow_status} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Action Control Panel */}
                    <div className="lg:col-span-12 xl:col-span-8 space-y-8">
                        <div className="glass-panel p-10 bg-brand-500/5 dark:bg-brand-500/10 border-brand-500/10 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008.93 11V7a5 5 0 00-10 0v4a13.916 13.916 0 001.069 5.378M12 11c0-3.517 1.009-6.799 2.753-9.571m3.44 2.04l-.054.09A13.916 13.916 0 0115.07 11V7a5 5 0 0110 0v4a13.916 13.916 0 01-1.069 5.378" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Identity Confirmation</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Performing action as <span className="font-bold text-brand-500 italic uppercase underline decoration-brand-500/30">{currentUserId}</span></p>
                                </div>
                            </div>

                            <div className="p-1 border border-slate-200 dark:border-white/5 rounded-2xl">
                                <div className="bg-white dark:bg-slate-900/80 p-8 rounded-[14px]">
                                    <EscrowActionPanel
                                        escrow={escrow}
                                        userId={currentUserId}
                                        userRole={currentUserRole}
                                        onUpdate={fetchData}
                                    />
                                </div>
                            </div>

                            {/* Lock Indicator */}
                            {escrow.ledger.is_locked && (
                                <div className="flex items-center gap-4 p-4 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-xl border border-red-500/10">
                                    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <p className="text-sm font-bold uppercase tracking-widest">Protocol Lockdown: Automated Resolution Active</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Audit Logs Sidebar */}
                    <div className="lg:col-span-12 xl:col-span-4 space-y-8">
                        <div className="glass-panel p-10 h-full max-h-[600px] flex flex-col">
                            <EscrowAuditLog logs={escrow.audit_trail} />
                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Security Parameters</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] uppercase tracking-tighter text-slate-400 font-bold">Lock Mechanism</p>
                                        <p className="text-[10px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase">
                                            {escrow.ledger.is_locked ? <span className="text-red-500">ENGAGED</span> : <span className="text-emerald-500">ARMED</span>}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] uppercase tracking-tighter text-slate-400 font-bold">Protocol Integrity</p>
                                        <p className="text-[10px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase">
                                            <span className="text-emerald-500">Verified</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Controls for Demo (Switcher) */}
                <div className="fixed bottom-8 right-8 z-50 glass-panel p-4 shadow-2xl space-y-4 border-brand-500 flex flex-col items-center">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-500 mb-2">Simulate Authority</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { localStorage.setItem("escrow_user_id", "demo_buyer"); localStorage.setItem("escrow_user_role", "BUYER"); window.location.reload(); }}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border uppercase tracking-wider transition-all duration-300 ${currentUserId === 'demo_buyer' ? 'bg-brand-500 text-white border-brand-500 scale-105 shadow-md shadow-brand-500/20' : 'border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100'}`}
                        >
                            Actor: Buyer
                        </button>
                        <button
                            onClick={() => { localStorage.setItem("escrow_user_id", "demo_seller"); localStorage.setItem("escrow_user_role", "SELLER"); window.location.reload(); }}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border uppercase tracking-wider transition-all duration-300 ${currentUserId === 'demo_seller' ? 'bg-brand-500 text-white border-brand-500 scale-105 shadow-md shadow-brand-500/20' : 'border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100'}`}
                        >
                            Actor: Seller
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionDashboard;
