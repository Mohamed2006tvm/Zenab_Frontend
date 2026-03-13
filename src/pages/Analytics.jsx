import { useEffect, useState } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import Layout from '../components/Layout';
import api from '../lib/api';

export default function Analytics() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        avgAqi: 0,
        maxTemp: 0,
        avgHumidity: 0,
        totalRecords: 0
    });

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/telemetry/ZENAB_TREE_01');
                const history = res.data.reverse(); // Display chronological order
                setData(history);

                // Calculate some basic stats
                if (history.length > 0) {
                    const avgAqi = (history.reduce((acc, h) => acc + h.aqi, 0) / history.length).toFixed(1);
                    const maxTemp = Math.max(...history.map(h => h.temperature)).toFixed(1);
                    const avgHum = (history.reduce((acc, h) => acc + h.humidity, 0) / history.length).toFixed(1);
                    setStats({
                        avgAqi,
                        maxTemp,
                        avgHumidity: avgHum,
                        totalRecords: history.length
                    });
                }
            } catch (error) {
                console.error("Failed to fetch analytics data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const Skeleton = () => (
        <div className="animate-pulse bg-[#111827] border border-slate-800 rounded-2xl h-64" />
    );

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-emerald-500/10 rounded-xl">📊</span>
                        Hardware Analytics
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Deep analysis of ZENAB_TREE_01 telemetry records</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Average AQI', value: stats.avgAqi, unit: '', color: 'text-emerald-400' },
                        { label: 'Max Temperature', value: stats.maxTemp, unit: '°C', color: 'text-orange-400' },
                        { label: 'Avg Humidity', value: stats.avgHumidity, unit: '%', color: 'text-cyan-400' },
                        { label: 'Total Logs', value: stats.totalRecords, unit: '', color: 'text-purple-400' },
                    ].map((s) => (
                        <div key={s.label} className="bg-[#111827] border border-slate-800 p-6 rounded-2xl transition-all hover:border-slate-700">
                            <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</div>
                            <div className={`text-3xl font-black ${s.color}`}>
                                {loading ? '...' : `${s.value}${s.unit}`}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* AQI Over Time */}
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-white font-bold mb-6 flex items-center gap-2">
                             AQI Historical Trend
                        </h2>
                        {loading ? <Skeleton /> : (
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                    <XAxis dataKey="timestamp" hide />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }} 
                                        labelStyle={{ color: '#94a3b8' }}
                                    />
                                    <Area type="monotone" dataKey="aqi" stroke="#10b981" fillOpacity={1} fill="url(#colorAqi)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Temp vs Humidity */}
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-white font-bold mb-6">Environmental Conditions</h2>
                        {loading ? <Skeleton /> : (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                    <XAxis dataKey="timestamp" hide />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }}
                                    />
                                    <Line type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} dot={false} name="Temp" />
                                    <Line type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={2} dot={false} name="Humid" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* PM2.5 Levels */}
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 lg:col-span-2">
                        <h2 className="text-white font-bold mb-6">PM2.5 Particulate Density</h2>
                        {loading ? <Skeleton /> : (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                    <XAxis dataKey="timestamp" hide />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                         contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }}
                                    />
                                    <Bar dataKey="pm25" fill="#ef4444" radius={[4, 4, 0, 0]} name="PM2.5" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
