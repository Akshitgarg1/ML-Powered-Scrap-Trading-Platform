import React, { useState, useEffect } from 'react';

const activities = [
    "New iPhone 14 listed in Mumbai",
    "MacBook Pro viewed by user in Delhi",
    "Price AI just valued a Sony Camera at ₹95,000",
    "Someone just bought Herman Miller seating",
    "Verified: Sony XM5 authenticated in Bangalore",
    "Visual Search used for a Vintage Rolex",
    "Flash Deal: 20% off on Gaming Peripherals",
    "New DJI Drone listed in Goa"
];

const LiveActivity = () => {
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const showInterval = setInterval(() => {
            setIndex(Math.floor(Math.random() * activities.length));
            setVisible(true);

            setTimeout(() => {
                setVisible(false);
            }, 5000); // Hide after 5 seconds

        }, 12000); // Every 12 seconds

        return () => clearInterval(showInterval);
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed bottom-6 left-6 z-50 animate-slide-up">
            <div className="glass-panel !rounded-2xl p-4 pr-6 flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 shadow-2xl border border-brand-500/20">
                <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Live Activity</span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[200px]">
                        {activities[index]}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LiveActivity;
