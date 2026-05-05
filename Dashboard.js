/**
 * DashboardModule - Resúmenes con filtro Día / Semana / Mes
 */
window.DashboardModule = ({ services, expenses }) => {
    const Icon = window.LucideIcon;
    const [period, setPeriod] = React.useState('day');

    const stats = React.useMemo(() => {
        const now = new Date();

        const inPeriod = (dateStr) => {
            const d = new Date(dateStr);
            if (period === 'day') {
                return d.toDateString() === now.toDateString();
            }
            if (period === 'week') {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                return d >= startOfWeek;
            }
            if (period === 'month') {
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }
            return false;
        };

        const filteredS = services.filter(s => inPeriod(s.date));
        const filteredE = expenses.filter(e => inPeriod(e.date));

        const income = filteredS.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
        const spend = filteredE.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

        return {
            income,
            spend,
            net: income - spend,
            count: filteredS.length,
            recentServices: filteredS.slice(0, 5),
        };
    }, [services, expenses, period]);

    const periodLabel = { day: 'hoy', week: 'esta semana', month: 'este mes' }[period];

    const PeriodBtn = ({ value, label }) => (
        <button
            onClick={() => setPeriod(value)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all ${
                period === value
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                    : 'bg-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10 border border-white/5'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8 fade-in">
            {/* Header con selector de período */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-extrabold text-white tracking-tight">Vista General</h3>
                    <p className="text-slate-400 text-sm font-medium">
                        Mostrando resultados de <span className="text-blue-400 font-bold">{periodLabel}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <PeriodBtn value="day" label="Hoy" />
                    <PeriodBtn value="week" label="Semana" />
                    <PeriodBtn value="month" label="Mes" />
                    <div className="ml-2 px-4 py-2 glass-card flex items-center gap-2 text-xs font-bold text-blue-400">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        En Vivo
                    </div>
                </div>
            </div>

            {/* Tarjeta de Balance Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-8 bg-gradient-to-br from-blue-600/20 via-indigo-900/40 to-slate-900/50 relative overflow-hidden flex flex-col justify-center min-h-[240px] border-blue-500/20 shadow-2xl shadow-blue-900/20">
                    <div className="relative z-10">
                        <p className="text-blue-400 font-black uppercase tracking-[0.2em] text-[10px] mb-3">
                            Ganancia Neta — {periodLabel}
                        </p>
                        <h2 className={`text-7xl font-extrabold tracking-tighter mb-4 ${stats.net >= 0 ? 'text-white' : 'text-rose-400'}`}>
                            ${stats.net.toLocaleString('es-AR')}
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                <Icon name={stats.net >= 0 ? 'trending-up' : 'trending-down'} size={14} className={stats.net >= 0 ? 'text-emerald-400' : 'text-rose-400'} />
                                <span className={`text-[10px] font-bold uppercase ${stats.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {stats.net >= 0 ? 'Positivo' : 'Negativo'}
                                </span>
                            </div>
                            <p className="text-slate-400 text-xs font-semibold">
                                Basado en <span className="text-white">{stats.count}</span> {stats.count === 1 ? 'servicio' : 'servicios'} {periodLabel}
                            </p>
                        </div>
                    </div>
                    <Icon name="bar-chart-3" size={180} className="absolute -right-10 -bottom-10 opacity-5 text-blue-400 transform -rotate-12" />
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="glass-card p-6 flex flex-col justify-between border-emerald-500/10">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                                <Icon name="arrow-up-right" size={20} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">INGRESOS</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-3xl font-black text-white">${stats.income.toLocaleString('es-AR')}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{stats.count} servicios {periodLabel}</p>
                        </div>
                    </div>

                    <div className="glass-card p-6 flex flex-col justify-between border-rose-500/10">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl">
                                <Icon name="arrow-down-left" size={20} />
                            </div>
                            <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-1 rounded">GASTOS</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-3xl font-black text-white">${stats.spend.toLocaleString('es-AR')}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Insumos y fijos {periodLabel}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección Inferior */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-slate-200 flex items-center gap-2 italic">
                            <Icon name="history" size={18} className="text-blue-500" />
                            Últimos Cortes — {periodLabel}
                        </h4>
                    </div>
                    <div className="space-y-4">
                        {stats.recentServices.length > 0 ? stats.recentServices.map(s => (
                            <div key={s.id} className="flex justify-between items-center p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/[0.03] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-xs">
                                        {s.client ? s.client.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-100">{s.client}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{s.service}</p>
                                    </div>
                                </div>
                                <p className="font-black text-emerald-400">+${Number(s.price).toLocaleString('es-AR')}</p>
                            </div>
                        )) : (
                            <div className="text-center py-10 flex flex-col items-center gap-3">
                                <Icon name="scissors" size={32} className="text-slate-800" />
                                <p className="text-slate-600 text-xs font-bold uppercase italic">Sin actividad {periodLabel}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Resumen visual del período */}
                <div className="glass-card p-8 flex flex-col justify-between border-white/5">
                    <h4 className="font-bold text-slate-200 flex items-center gap-2 italic mb-6">
                        <Icon name="pie-chart" size={18} className="text-blue-500" />
                        Resumen del período
                    </h4>

                    {stats.income > 0 || stats.spend > 0 ? (
                        <div className="space-y-5 flex-1 flex flex-col justify-center">
                            {/* Barra de ingresos */}
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                                    <span className="text-emerald-400">Ingresos</span>
                                    <span className="text-white">${stats.income.toLocaleString('es-AR')}</span>
                                </div>
                                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>

                            {/* Barra de gastos relativa a ingresos */}
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                                    <span className="text-rose-400">Gastos</span>
                                    <span className="text-white">${stats.spend.toLocaleString('es-AR')}</span>
                                </div>
                                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500 rounded-full transition-all duration-700"
                                        style={{ width: `${Math.min((stats.spend / (stats.income || 1)) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Barra de ganancia neta */}
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                                    <span className="text-blue-400">Ganancia neta</span>
                                    <span className={stats.net >= 0 ? 'text-blue-400' : 'text-rose-400'}>
                                        ${stats.net.toLocaleString('es-AR')}
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-700 ${stats.net >= 0 ? 'bg-blue-500' : 'bg-rose-600'}`}
                                        style={{ width: `${Math.min(Math.abs(stats.net / (stats.income || 1)) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Margen</p>
                                <p className={`text-lg font-black italic ${stats.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {stats.income > 0 ? `${Math.round((stats.net / stats.income) * 100)}%` : '—'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3">
                            <Icon name="bar-chart-2" size={40} className="text-slate-800" />
                            <p className="text-slate-600 text-xs font-bold uppercase italic text-center">
                                Sin datos para {periodLabel}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
