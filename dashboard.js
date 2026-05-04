/**
 * DashboardModule - Resúmenes
 * Este componente muestra las estadísticas clave del día y el balance general.
 */
window.DashboardModule = ({ services, expenses }) => {
    const Icon = window.LucideIcon;

    // Cálculo de estadísticas en tiempo real
    const stats = React.useMemo(() => {
        const now = new Date().toDateString();
        
        // Filtrar servicios y gastos del día de hoy
        const todayS = services.filter(s => new Date(s.date).toDateString() === now);
        const todayE = expenses.filter(e => new Date(e.date).toDateString() === now);
        
        const income = todayS.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
        const spend = todayE.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        
        return { 
            income, 
            spend, 
            net: income - spend, 
            count: todayS.length,
            growth: todayS.length > 0 ? 100 : 0 // Placeholder para lógica de crecimiento
        };
    }, [services, expenses]);

    return (
        <div className="space-y-8 fade-in">
            {/* Header del Dashboard */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-extrabold text-white tracking-tight">Vista General</h3>
                    <p className="text-slate-400 text-sm font-medium">Esto es lo que está pasando en tu barbería hoy.</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 glass-card flex items-center gap-2 text-xs font-bold text-blue-400">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        En Vivo
                    </div>
                </div>
            </div>

            {/* Tarjeta de Balance Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-8 bg-gradient-to-br from-blue-600/20 via-indigo-900/40 to-slate-900/50 relative overflow-hidden flex flex-col justify-center min-h-[240px] border-blue-500/20 shadow-2xl shadow-blue-900/20">
                    <div className="relative z-10">
                        <p className="text-blue-400 font-black uppercase tracking-[0.2em] text-[10px] mb-3">Ganancia Neta Disponible</p>
                        <h2 className="text-7xl font-extrabold tracking-tighter text-white mb-4">
                            ${stats.net.toLocaleString()}
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                <Icon name="trending-up" size={14} className="text-emerald-400" />
                                <span className="text-[10px] font-bold text-emerald-400 uppercase">Excelente ritmo</span>
                            </div>
                            <p className="text-slate-400 text-xs font-semibold">
                                Basado en <span className="text-white">{stats.count}</span> servicios hoy
                            </p>
                        </div>
                    </div>
                    {/* Icono decorativo de fondo */}
                    <Icon name="bar-chart-3" size={180} className="absolute -right-10 -bottom-10 opacity-5 text-blue-400 transform -rotate-12" />
                </div>
                
                {/* Mini Stats Lateral */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="glass-card p-6 flex flex-col justify-between border-emerald-500/10">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                                <Icon name="arrow-up-right" size={20} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">INGRESOS</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-3xl font-black text-white">${stats.income.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Total de servicios</p>
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
                            <p className="text-3xl font-black text-white">${stats.spend.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Insumos y fijos</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección Inferior - Actividad Reciente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-slate-200 flex items-center gap-2 italic">
                            <Icon name="history" size={18} className="text-blue-500" />
                            Últimos Cortes
                        </h4>
                        <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Ver Todo</button>
                    </div>
                    <div className="space-y-4">
                        {services.length > 0 ? services.slice(0, 4).map(s => (
                            <div key={s.id} className="flex justify-between items-center p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/[0.03] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-xs">
                                        {s.client.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-100">{s.client}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{s.service}</p>
                                    </div>
                                </div>
                                <p className="font-black text-emerald-400">+${Number(s.price).toLocaleString()}</p>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-slate-600 text-xs font-bold uppercase italic">No hay actividad reciente</div>
                        )}
                    </div>
                </div>

                <div className="glass-card p-8 border-dashed border-slate-700 bg-transparent flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-3xl bg-blue-600/10 flex items-center justify-center mb-4 text-blue-500">
                        <Icon name="pie-chart" size={32} />
                    </div>
                    <h5 className="text-slate-200 font-extrabold uppercase tracking-tight">Análisis de Rendimiento</h5>
                    <p className="text-slate-500 text-sm mt-2 max-w-[250px]">Pronto podrás ver gráficos detallados de tus servicios más pedidos y horas pico.</p>
                </div>
            </div>
        </div>
    );
};
