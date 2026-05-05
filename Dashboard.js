/**
 * DashboardModule - Resúmenes con navegación Mes > Semana > Día
 * v6 - Fix parseLocalDate para fechas solo "YYYY-MM-DD" + debug log
 */
window.DashboardModule = ({ services, expenses }) => {
    const Icon = window.LucideIcon;
    const now = new Date();

    const [viewMode, setViewMode] = React.useState('day');
    const [selectedMonth, setSelectedMonth] = React.useState(now.getMonth());
    const [selectedYear, setSelectedYear] = React.useState(now.getFullYear());
    const [selectedDay, setSelectedDay] = React.useState(now.getDate());
    const [selectedWeek, setSelectedWeek] = React.useState(0);

    const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    const weeksInMonth = React.useMemo(() => {
        const total = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const weeks = [];
        let day = 1;
        while (day <= total && weeks.length < 6) {
            const start = day;
            const startDate = new Date(selectedYear, selectedMonth, day);
            const dow = startDate.getDay();
            const remaining = dow === 0 ? 0 : 7 - dow;
            const end = Math.min(day + remaining, total);
            weeks.push({ startDay: start, endDay: end });
            day = end + 1;
        }
        return weeks;
    }, [selectedMonth, selectedYear]);

    const prevMonth = () => {
        const nm = selectedMonth === 0 ? 11 : selectedMonth - 1;
        const ny = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
        setSelectedMonth(nm);
        setSelectedYear(ny);
        setSelectedDay(1);
        setSelectedWeek(0);
    };

    const nextMonth = () => {
        const nm = selectedMonth === 11 ? 0 : selectedMonth + 1;
        const ny = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
        setSelectedMonth(nm);
        setSelectedYear(ny);
        setSelectedDay(1);
        setSelectedWeek(0);
    };

    const parseLocalDate = (dateStr) => {
        if (!dateStr) return null;
        try {
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                const [y, m, d] = dateStr.split('-').map(Number);
                return { y, m: m - 1, d };
            }
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return null;
            return {
                y: d.getFullYear(),
                m: d.getMonth(),
                d: d.getDate()
            };
        } catch(e) {
            return null;
        }
    };

    const stats = React.useMemo(() => {
        // DEBUG - sacar después de confirmar que funciona
        if (services.length > 0) {
            console.log('[Dashboard] Ejemplo fecha servicio:', services[0].date, typeof services[0].date);
        }
        if (expenses.length > 0) {
            console.log('[Dashboard] Ejemplo fecha gasto:', expenses[0].date, typeof expenses[0].date);
        }

        const inRange = (dateStr) => {
            const p = parseLocalDate(dateStr);
            if (!p) return false;

            if (viewMode === 'month') {
                return p.y === selectedYear && p.m === selectedMonth;
            }
            if (viewMode === 'week') {
                const week = weeksInMonth[selectedWeek];
                if (!week) return false;
                return p.y === selectedYear &&
                       p.m === selectedMonth &&
                       p.d >= week.startDay &&
                       p.d <= week.endDay;
            }
            if (viewMode === 'day') {
                return p.y === selectedYear &&
                       p.m === selectedMonth &&
                       p.d === selectedDay;
            }
            return false;
        };

        const filteredS = services.filter(s => inRange(s.date));
        const filteredE = expenses.filter(e => inRange(e.date));

        const income = filteredS.reduce((a, s) => a + Number(s.price  || 0), 0);
        const spend  = filteredE.reduce((a, e) => a + Number(e.amount || 0), 0);

        const svcCount = {};
        filteredS.forEach(s => {
            if (s.service) svcCount[s.service] = (svcCount[s.service] || 0) + 1;
        });
        const topEntry = Object.entries(svcCount).sort((a,b) => b[1]-a[1])[0];

        return {
            income, spend,
            net: income - spend,
            count: filteredS.length,
            expenseCount: filteredE.length,
            avgTicket: filteredS.length > 0 ? Math.round(income / filteredS.length) : 0,
            recentServices: [...filteredS].reverse().slice(0, 5),
            topService: topEntry ? topEntry[0] : null,
            margin: income > 0 ? Math.round(((income - spend) / income) * 100) : 0
        };
    }, [services, expenses, viewMode, selectedMonth, selectedYear, selectedDay, selectedWeek, weeksInMonth]);

    const periodLabel =
        viewMode === 'day'
            ? `${selectedDay} de ${MONTHS[selectedMonth]} ${selectedYear}`
        : viewMode === 'week' && weeksInMonth[selectedWeek]
            ? `Sem ${selectedWeek + 1} · ${MONTHS[selectedMonth]} ${selectedYear}`
        : `${MONTHS[selectedMonth]} ${selectedYear}`;

    return (
        <div className="space-y-6 fade-in">

            {/* ── SELECTOR ── */}
            <div className="glass-card p-5 border-white/5 space-y-4">

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button onClick={prevMonth}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                            <Icon name="chevron-left" size={16} />
                        </button>
                        <div className="px-4 py-2 bg-blue-600/20 border border-blue-500/20 rounded-xl min-w-[170px] text-center">
                            <span className="text-sm font-black text-blue-300 uppercase tracking-wide">
                                {MONTHS[selectedMonth]} {selectedYear}
                            </span>
                        </div>
                        <button onClick={nextMonth}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                            <Icon name="chevron-right" size={16} />
                        </button>
                    </div>

                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                        {[['day','Día'], ['week','Semana'], ['month','Mes']].map(([val, lbl]) => (
                            <button key={val}
                                onClick={() => setViewMode(val)}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                    viewMode === val
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                        : 'text-slate-500 hover:text-slate-300'
                                }`}>
                                {lbl}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sub-selector días */}
                {viewMode === 'day' && (
                    <div className="flex gap-1.5 flex-wrap">
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                            <button key={d}
                                onClick={() => setSelectedDay(d)}
                                className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${
                                    selectedDay === d
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                        : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'
                                }`}>
                                {d}
                            </button>
                        ))}
                    </div>
                )}

                {/* Sub-selector semanas */}
                {viewMode === 'week' && (
                    <div className="flex gap-2 flex-wrap">
                        {weeksInMonth.map((w, i) => (
                            <button key={i}
                                onClick={() => setSelectedWeek(i)}
                                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                    selectedWeek === i
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                        : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white border border-white/5'
                                }`}>
                                Sem {i + 1} · {w.startDay}/{selectedMonth+1} — {w.endDay}/{selectedMonth+1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── BALANCE ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-8 bg-gradient-to-br from-blue-600/20 via-indigo-900/40 to-slate-900/50 relative overflow-hidden flex flex-col justify-center min-h-[200px] border-blue-500/20 shadow-2xl shadow-blue-900/20">
                    <div className="relative z-10">
                        <p className="text-blue-400 font-black uppercase tracking-[0.2em] text-[10px] mb-3">
                            Ganancia Neta · {periodLabel}
                        </p>
                        <h2 className={`text-6xl font-extrabold tracking-tighter mb-4 ${stats.net >= 0 ? 'text-white' : 'text-rose-400'}`}>
                            ${stats.net.toLocaleString('es-AR')}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                <Icon name={stats.net >= 0 ? 'trending-up' : 'trending-down'} size={13}
                                    className={stats.net >= 0 ? 'text-emerald-400' : 'text-rose-400'} />
                                <span className={`text-[10px] font-bold uppercase ${stats.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    Margen {stats.margin}%
                                </span>
                            </div>
                            <p className="text-slate-400 text-xs font-semibold">
                                <span className="text-white">{stats.count}</span> {stats.count === 1 ? 'servicio' : 'servicios'}
                                {stats.topService && (
                                    <span className="text-slate-500"> · Top: <span className="text-blue-400">{stats.topService}</span></span>
                                )}
                            </p>
                        </div>
                    </div>
                    <Icon name="bar-chart-3" size={180} className="absolute -right-10 -bottom-10 opacity-5 text-blue-400 transform -rotate-12" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="glass-card p-5 flex flex-col justify-between border-emerald-500/10">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                                <Icon name="arrow-up-right" size={18} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">INGRESOS</span>
                        </div>
                        <div className="mt-3">
                            <p className="text-2xl font-black text-white">${stats.income.toLocaleString('es-AR')}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">
                                Ticket prom: ${stats.avgTicket.toLocaleString('es-AR')}
                            </p>
                        </div>
                    </div>

                    <div className="glass-card p-5 flex flex-col justify-between border-rose-500/10">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl">
                                <Icon name="arrow-down-left" size={18} />
                            </div>
                            <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-1 rounded">GASTOS</span>
                        </div>
                        <div className="mt-3">
                            <p className="text-2xl font-black text-white">${stats.spend.toLocaleString('es-AR')}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">
                                {stats.expenseCount} {stats.expenseCount === 1 ? 'egreso' : 'egresos'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── INFERIOR ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <div className="flex justify-between items-center mb-5">
                        <h4 className="font-bold text-slate-200 flex items-center gap-2 italic">
                            <Icon name="scissors" size={16} className="text-blue-500" />
                            Cortes · {periodLabel}
                        </h4>
                        <span className="text-[10px] font-black text-slate-600 bg-white/5 px-2 py-1 rounded-lg uppercase">
                            {stats.count} total
                        </span>
                    </div>
                    <div className="space-y-3">
                        {stats.recentServices.length > 0 ? stats.recentServices.map(s => (
                            <div key={s.id} className="flex justify-between items-center p-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/[0.03] transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-xs">
                                        {s.client ? s.client.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-100">{s.client}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{s.service}</p>
                                    </div>
                                </div>
                                <p className="font-black text-emerald-400 text-sm">+${Number(s.price).toLocaleString('es-AR')}</p>
                            </div>
                        )) : (
                            <div className="text-center py-10 flex flex-col items-center gap-3">
                                <Icon name="scissors" size={28} className="text-slate-800" />
                                <p className="text-slate-600 text-xs font-bold uppercase italic">Sin servicios en este período</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-card p-6 flex flex-col border-white/5">
                    <h4 className="font-bold text-slate-200 flex items-center gap-2 italic mb-5">
                        <Icon name="pie-chart" size={16} className="text-blue-500" />
                        Resumen financiero
                    </h4>

                    {stats.income > 0 || stats.spend > 0 ? (
                        <div className="space-y-4 flex-1 flex flex-col justify-center">
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                                    <span className="text-emerald-400">Ingresos</span>
                                    <span className="text-white">${stats.income.toLocaleString('es-AR')}</span>
                                </div>
                                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                                    <span className="text-rose-400">Gastos</span>
                                    <span className="text-white">${stats.spend.toLocaleString('es-AR')}</span>
                                </div>
                                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500 rounded-full"
                                        style={{ width: `${Math.min((stats.spend / (stats.income || 1)) * 100, 100)}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                                    <span className="text-blue-400">Ganancia neta</span>
                                    <span className={stats.net >= 0 ? 'text-blue-400' : 'text-rose-400'}>
                                        ${stats.net.toLocaleString('es-AR')}
                                    </span>
                                </div>
                                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${stats.net >= 0 ? 'bg-blue-500' : 'bg-rose-600'}`}
                                        style={{ width: `${Math.min(Math.abs((stats.net / (stats.income || 1)) * 100), 100)}%` }} />
                                </div>
                            </div>

                            <div className="mt-2 pt-4 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Servicios</p>
                                    <p className="text-xl font-black text-white">{stats.count}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Ticket prom.</p>
                                    <p className="text-xl font-black text-amber-400">${stats.avgTicket.toLocaleString('es-AR')}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Margen</p>
                                    <p className={`text-xl font-black italic ${stats.margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {stats.margin}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3">
                            <Icon name="bar-chart-2" size={36} className="text-slate-800" />
                            <p className="text-slate-600 text-xs font-bold uppercase italic text-center">Sin datos para este período</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
