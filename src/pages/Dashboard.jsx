import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import AQICard from '../components/AQICard';
import SmartAlert from '../components/SmartAlert';
import api from '../lib/api';

const quickLinks = [
    { to: '/map', label: 'Interactive Map', icon: '🗺️', desc: 'View AQI heatmap' },
    { to: '/ai-insights', label: 'AI Prediction', icon: '🤖', desc: 'Predictive analytics' },
    { to: '/analyze', label: 'Analyzer', icon: '🔬', desc: 'Analyze PM levels' },
    { to: '/system-control', label: 'System Control', icon: '⚡', desc: 'Manage ZENAB device' },
];

// Power BI SVG Icon
function PowerBIIcon({ className = 'w-6 h-6' }) {
    return (
        <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="14" width="6" height="16" rx="1.5" fill="#F2C811" />
            <rect x="11" y="8" width="6" height="22" rx="1.5" fill="#F2C811" opacity="0.85" />
            <rect x="20" y="2" width="6" height="28" rx="1.5" fill="#F2C811" opacity="0.65" />
        </svg>
    );
}

export default function Dashboard() {
    const [stations, setStations] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Live Simulation State ---
    const [liveAqi, setLiveAqi] = useState(42);
    const [liveTemp, setLiveTemp] = useState(24.5);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveAqi(prev => {
                const change = (Math.random() - 0.5) * 4;
                return Math.max(10, Math.min(450, Math.round(prev + change)));
            });
            setLiveTemp(prev => {
                const change = (Math.random() - 0.5) * 0.4;
                return parseFloat((prev + change).toFixed(1));
            });
            setLastUpdated(new Date());
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const statusInfo = useMemo(() => {
        if (liveAqi <= 50) return { label: 'Safe', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
        if (liveAqi <= 100) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
        if (liveAqi <= 150) return { label: 'Warning', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
        return { label: 'Dangerous', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
    }, [liveAqi]);
    // ----------------------------


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stationsRes, summaryRes] = await Promise.all([
                    api.get('/stations'),
                    api.get('/aqi/summary'),
                ]);
                setStations(stationsRes.data);
                setSummary(summaryRes.data);
            } catch {
                setError('Unable to connect to server. Make sure the backend is running on port 5000.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);



    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">ZENAB Monitoring</h1>
                        <p className="text-slate-400 text-sm mt-1">AI-Powered Environmental Control Dashboard</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            System Active
                        </div>
                        <Link
                            to="/system-control"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
                        >
                            <span>⚡</span> Control
                        </Link>
                    </div>
                </div>

                {/* Smart Alert Banner */}
                <SmartAlert aqi={liveAqi} />

                {/* HERO CARD - Live Metrics */}
                <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/40 via-[#0d1528] to-[#0a0f1e] border border-emerald-500/20 p-8 relative group">
                        {/* Decorative background circle */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-500/10 transition-colors duration-500" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 py-4">
                            <div className="text-center md:text-left">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border ${statusInfo.border} ${statusInfo.bg} ${statusInfo.color}`}>
                                    {statusInfo.label} Status
                                </span>
                                <div className="flex items-baseline gap-3 mb-2 justify-center md:justify-start">
                                    <span className={`text-7xl font-black ${statusInfo.color}`}>
                                        {liveAqi}
                                    </span>
                                    <span className="text-slate-500 font-bold text-xl uppercase">AQI</span>
                                </div>
                                <p className="text-slate-400 text-sm max-w-xs mx-auto md:mx-0">
                                    Local air quality is {statusInfo.label.toLowerCase()}. {liveAqi > 150 ? 'Please wear a mask outdoors.' : 'Safe for all outdoor activities.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm min-w-[140px]">
                                    <div className="text-cyan-400 text-2xl mb-1">🌡️</div>
                                    <div className="text-2xl font-bold text-white">{liveTemp}°C</div>
                                    <div className="text-slate-500 text-xs font-medium uppercase mt-1">Temperature</div>
                                </div>
                                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm min-w-[140px]">
                                    <div className="text-purple-400 text-2xl mb-1">⏱️</div>
                                    <div className="text-lg font-bold text-white">{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                                    <div className="text-slate-500 text-xs font-medium uppercase mt-1">Last Updated</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 grid grid-cols-1 gap-4">
                        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-2xl">📡</div>
                                <div>
                                    <div className="text-white font-bold">Tree Node 01</div>
                                    <div className="text-slate-500 text-xs mt-1">Location: Bangalore</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-emerald-400 text-xs font-bold flex items-center gap-1 justify-end">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                    Online
                                </div>
                                <div className="text-slate-600 text-[10px] mt-1 font-mono">ID: ZEN-001</div>
                            </div>
                        </div>

                        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <div className="text-slate-400 text-sm font-semibold">Weekly Health Risk</div>
                                <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-black border border-yellow-500/20 uppercase">Moderate</span>
                            </div>
                            <div className="mt-4 flex items-end gap-1 h-12">
                                {[35, 42, 38, 55, 62, 48, 42].map((v, i) => (
                                    <div key={i} className="flex-1 bg-slate-800 rounded-sm hover:bg-emerald-500/40 transition-colors group relative" style={{ height: `${(v / 80) * 100}%` }}>
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{v} AQI</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {/* Stats Bar */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-[#111827] border border-slate-800 rounded-xl p-5 animate-pulse h-24" />
                        ))}
                    </div>
                ) : summary && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Total Stations', val: summary.total, color: 'text-cyan-400', icon: '📡' },
                            { label: 'Hazardous Areas', val: summary.hazardous, color: 'text-rose-400', icon: '⚠️' },
                            { label: 'Safe Zones', val: summary.safe, color: 'text-emerald-400', icon: '✅' },
                            { label: 'Average AQI', val: summary.avgAqi, color: 'text-yellow-400', icon: '📈' },
                        ].map(({ label, val, color, icon }) => (
                            <div key={label} className="bg-[#111827] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                                <div className="text-2xl mb-2">{icon}</div>
                                <div className={`text-3xl font-black ${color}`}>{val}</div>
                                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick Links */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {quickLinks.map((q) => (
                        <Link
                            key={q.to}
                            to={q.to}
                            className="bg-[#111827] border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 transition-all hover:bg-[#1a2235] group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">{q.icon}</div>
                            <div className="text-white font-bold text-sm group-hover:text-emerald-400 transition-colors">{q.label}</div>
                            <div className="text-slate-500 text-[11px] mt-1 leading-relaxed">{q.desc}</div>
                        </Link>
                    ))}
                </div>

                {/* Power BI Call to Action */}
                <Link 
                    to="/analytics"
                    className="mb-8 block bg-[#111827] border border-slate-800 hover:border-yellow-500/40 rounded-2xl p-5 transition-all group overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-yellow-500/10 transition-colors" />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <PowerBIIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">Advanced Power BI Analytics</h3>
                                <p className="text-slate-500 text-xs mt-0.5">View real-time streaming data and complex environmental reports.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-yellow-500 text-sm font-bold">
                            Open Analytics <span>→</span>
                        </div>
                    </div>
                </Link>

                {/* Live AQI Grid */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-semibold text-lg">Live Air Quality Data</h2>
                    <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        Live
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-[#111827] border border-slate-800 rounded-xl p-4 animate-pulse h-48" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {stations.map((station) => (
                            <AQICard key={station._id} station={station} />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
