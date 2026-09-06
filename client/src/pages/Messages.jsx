import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
	getMessageThreads,
	getMessageThread,
	sendMessage,
	markThreadRead,
	markThreadSold,
	getProduct,
} from "../services/api";
import { getImageUrl } from "../utils/imageUtils";
import { formatPrice } from "../utils/formatPrice";

const Messages = () => {
	const { user } = useAuth();
	const { threadId: routeThreadId } = useParams();
	const navigate = useNavigate();

	const [threads, setThreads] = useState([]);
	const [activeThreadId, setActiveThreadId] = useState(routeThreadId || null);
	const [activeThread, setActiveThread] = useState(null);
	const [productDetails, setProductDetails] = useState(null);
	const [messages, setMessages] = useState([]);
	const [newMessageText, setNewMessageText] = useState("");
	const [loadingThreads, setLoadingThreads] = useState(true);
	const [loadingChat, setLoadingChat] = useState(false);
	const [sending, setSending] = useState(false);
	const [markingSold, setMarkingSold] = useState(false);
	const messagesEndRef = useRef(null);

	const currentUserId = user?.uid || localStorage.getItem("user_id");

	// Auto scroll to bottom
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Fetch all threads
	const loadThreads = async () => {
		if (!currentUserId) return;
		try {
			const res = await getMessageThreads(currentUserId);
			if (res?.success) {
				const sortedThreads = (res.threads || []).sort((a, b) => {
					const timeA = new Date(
						a.last_message?.timestamp || a.updated_at || a.created_at || 0,
					).getTime();
					const timeB = new Date(
						b.last_message?.timestamp || b.updated_at || b.created_at || 0,
					).getTime();
					return timeB - timeA;
				});
				setThreads(sortedThreads);

				// If no active thread is selected yet and we have threads, pick the first or route param
				if (!activeThreadId && sortedThreads.length > 0) {
					const initialId = routeThreadId || sortedThreads[0].id;
					setActiveThreadId(initialId);
				}
			}
		} catch (err) {
			console.error("Error loading message threads:", err);
		} finally {
			setLoadingThreads(false);
		}
	};

	useEffect(() => {
		loadThreads();
		const interval = setInterval(loadThreads, 5000);
		return () => clearInterval(interval);
	}, [currentUserId]);

	// Update active thread when route param changes
	useEffect(() => {
		if (routeThreadId) {
			setActiveThreadId(routeThreadId);
		}
	}, [routeThreadId]);

	// Fetch active thread messages & product info
	const loadActiveThread = async (isSilent = false) => {
		if (!activeThreadId) return;
		if (!isSilent) setLoadingChat(true);

		try {
			const res = await getMessageThread(activeThreadId);
			if (res?.success && res.thread) {
				setActiveThread(res.thread);
				const threadMsgs = res.thread.messages || [];
				setMessages(threadMsgs);

				// Mark as read
				if (currentUserId) {
					markThreadRead(activeThreadId, currentUserId).catch(() => {});
				}

				// Fetch product if not loaded yet
				if (res.thread.product_id && (!productDetails || productDetails.id !== res.thread.product_id)) {
					try {
						const pRes = await getProduct(res.thread.product_id);
						if (pRes?.success) {
							setProductDetails(pRes.product);
						}
					} catch (pErr) {
						console.error("Error fetching thread product:", pErr);
					}
				}
			}
		} catch (err) {
			console.error("Error fetching thread details:", err);
		} finally {
			if (!isSilent) setLoadingChat(false);
		}
	};

	useEffect(() => {
		loadActiveThread(false);
		const interval = setInterval(() => {
			loadActiveThread(true);
		}, 3000);
		return () => clearInterval(interval);
	}, [activeThreadId]);

	// Send a message
	const handleSendMessage = async (e) => {
		e?.preventDefault();
		const text = newMessageText.trim();
		if (!text || !activeThreadId || !currentUserId || sending) return;

		setSending(true);
		try {
			const res = await sendMessage(activeThreadId, currentUserId, text);
			if (res?.success) {
				setNewMessageText("");
				await loadActiveThread(true);
				loadThreads();
			}
		} catch (err) {
			console.error("Failed to send message:", err);
		} finally {
			setSending(false);
		}
	};

	// Mark thread / item as sold
	const handleMarkAsSold = async () => {
		if (!activeThreadId || !currentUserId || markingSold) return;
		if (!window.confirm("Are you sure you want to mark this item as sold?")) return;

		setMarkingSold(true);
		try {
			const res = await markThreadSold(activeThreadId, currentUserId);
			if (res?.success) {
				await loadActiveThread(true);
				loadThreads();
			}
		} catch (err) {
			console.error("Error marking thread sold:", err);
		} finally {
			setMarkingSold(false);
		}
	};

	// Format timestamp
	const formatTime = (ts) => {
		if (!ts) return "";
		try {
			const date = new Date(ts);
			return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
		} catch {
			return "";
		}
	};

	const formatDate = (ts) => {
		if (!ts) return "";
		try {
			const date = new Date(ts);
			return date.toLocaleDateString([], { month: "short", day: "numeric" });
		} catch {
			return "";
		}
	};

	const isSeller = activeThread?.seller_id === currentUserId;
	const otherUserId = isSeller ? activeThread?.buyer_id : activeThread?.seller_id;

	return (
		<div className="section-container mt-6 sm:mt-10 mb-16 px-4 sm:px-6">
			<div className="max-w-6xl mx-auto">
				{/* Top Header */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
					<div>
						<h1 className="text-3xl font-display font-black text-slate-900 dark:text-white">
							Direct <span className="text-gradient">Messages</span>
						</h1>
						<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
							Chat directly with buyers and sellers to discuss items and negotiate trades.
						</p>
					</div>
					<button
						onClick={() => navigate("/browse")}
						className="btn-secondary !py-2 !px-4 text-xs font-semibold"
					>
						Explore Marketplace
					</button>
				</div>

				{/* Main Container */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden min-h-[620px]">
					{/* Left: Thread List */}
					<div
						className={`lg:col-span-4 border-r border-slate-100 dark:border-white/10 flex flex-col ${
							activeThreadId ? "hidden lg:flex" : "flex"
						}`}
					>
						<div className="p-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50">
							<h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
								Conversations ({threads.length})
							</h2>
						</div>

						<div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
							{loadingThreads ? (
								<div className="p-8 text-center text-slate-400">
									<div className="h-6 w-6 animate-spin rounded-full border-b-2 border-brand-500 mx-auto mb-2"></div>
									<p className="text-xs">Loading chats...</p>
								</div>
							) : threads.length === 0 ? (
								<div className="p-8 text-center text-slate-400">
									<p className="text-sm font-medium">No messages yet</p>
									<p className="text-xs mt-1">
										Inquire about any listing on the marketplace to start chatting!
									</p>
								</div>
							) : (
								threads.map((t) => {
									const isSelected = t.id === activeThreadId;
									const otherParty = t.seller_id === currentUserId ? t.buyer_id : t.seller_id;
									const lastMsg = t.last_message?.content || "Started a conversation";
									const lastTime = t.last_message?.timestamp || t.updated_at;

									return (
										<button
											key={t.id}
											onClick={() => {
												setActiveThreadId(t.id);
												navigate(`/messages/${t.id}`);
											}}
											className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
												isSelected
													? "bg-brand-500/10 border-l-4 border-brand-500"
													: "hover:bg-slate-50 dark:hover:bg-slate-800/40"
											}`}
										>
											<div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 flex-shrink-0 text-sm">
												{(otherParty || "U").slice(0, 2).toUpperCase()}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between gap-2">
													<p className="text-xs font-bold text-slate-900 dark:text-white truncate">
														User: {otherParty || "Trader"}
													</p>
													<span className="text-[10px] text-slate-400 whitespace-nowrap">
														{formatDate(lastTime)}
													</span>
												</div>
												<p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
													{lastMsg}
												</p>
												{t.status === "sold" && (
													<span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
														Item Sold
													</span>
												)}
											</div>
										</button>
									);
								})
							)}
						</div>
					</div>

					{/* Right: Active Chat View */}
					<div
						className={`lg:col-span-8 flex flex-col ${
							!activeThreadId ? "hidden lg:flex" : "flex"
						}`}
					>
						{activeThreadId ? (
							<>
								{/* Chat Header */}
								<div className="p-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between gap-4 bg-slate-50/60 dark:bg-slate-900/60">
									<div className="flex items-center gap-3">
										<button
											onClick={() => setActiveThreadId(null)}
											className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
										>
											←
										</button>
										<div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
											{(otherUserId || "U").slice(0, 2).toUpperCase()}
										</div>
										<div>
											<p className="text-sm font-bold text-slate-900 dark:text-white">
												{otherUserId ? `Trader ${otherUserId.slice(0, 8)}...` : "Direct Trader"}
											</p>
											<p className="text-[11px] text-slate-400">
												{isSeller ? "Buyer inquiry" : "Seller conversation"}
											</p>
										</div>
									</div>

									{/* Product Snippet Header / Actions */}
									<div className="flex items-center gap-3">
										{productDetails && (
											<div className="hidden sm:flex items-center gap-3 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
												{productDetails.image_url && (
													<img
														src={getImageUrl(productDetails.image_url)}
														alt={productDetails.title}
														className="w-7 h-7 rounded-lg object-cover"
													/>
												)}
												<div className="text-left">
													<p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
														{productDetails.title}
													</p>
													<p className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">
														{formatPrice(productDetails.price)}
													</p>
												</div>
												<Link
													to={`/product/${productDetails.id}`}
													className="text-[10px] text-indigo-500 hover:underline ml-1"
												>
													View
												</Link>
											</div>
										)}

										{isSeller && activeThread?.status !== "sold" && (
											<button
												onClick={handleMarkAsSold}
												disabled={markingSold}
												className="btn-secondary !py-1.5 !px-3 text-[11px] font-semibold"
											>
												{markingSold ? "Marking..." : "Mark Sold"}
											</button>
										)}
									</div>
								</div>

								{/* Messages Area */}
								<div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/20 dark:bg-slate-950/20">
									{loadingChat ? (
										<div className="h-full flex items-center justify-center text-slate-400">
											<div className="h-6 w-6 animate-spin rounded-full border-b-2 border-brand-500"></div>
										</div>
									) : messages.length === 0 ? (
										<div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
											<p className="text-sm font-semibold">No messages in this chat yet.</p>
											<p className="text-xs text-slate-400 mt-1">
												Say hello and discuss item details, price, or meetup location!
											</p>
										</div>
									) : (
										messages.map((msg, idx) => {
											const isMe = msg.sender_id === currentUserId;
											return (
												<div
													key={msg.id || idx}
													className={`flex flex-col ${
														isMe ? "items-end" : "items-start"
													}`}
												>
													<div
														className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
															isMe
																? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-br-none"
																: "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-white/10 rounded-bl-none shadow-sm"
														}`}
													>
														<p>{msg.content || msg.text}</p>
													</div>
													<span className="text-[10px] text-slate-400 mt-1 px-1">
														{formatTime(msg.timestamp)}
													</span>
												</div>
											);
										})
									)}
									<div ref={messagesEndRef} />
								</div>

								{/* Message Input Form */}
								<form
									onSubmit={handleSendMessage}
									className="p-3 sm:p-4 border-t border-slate-100 dark:border-white/10 flex items-center gap-3 bg-white dark:bg-slate-900"
								>
									<input
										type="text"
										value={newMessageText}
										onChange={(e) => setNewMessageText(e.target.value)}
										placeholder="Type your message to the trader..."
										className="input-field flex-1 !py-2.5 text-sm"
										disabled={sending}
									/>
									<button
										type="submit"
										disabled={sending || !newMessageText.trim()}
										className="btn-gradient !py-2.5 !px-5 text-sm font-semibold disabled:opacity-50"
									>
										{sending ? "Sending..." : "Send"}
									</button>
								</form>
							</>
						) : (
							<div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
								<svg
									className="w-16 h-16 opacity-30 mb-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="1"
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
								<h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
									Select a Conversation
								</h3>
								<p className="text-xs max-w-sm mt-1">
									Choose a chat from the left or inquire about a product to start direct buyer-seller messaging.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Messages;
