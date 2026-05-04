/**
 * HistorialModule - Panel de Estadísticas Avanzadas
 * Con soporte para eliminar ventas del historial.
 */
window.HistorialModule = ({ services, expenses, onDeleteService }) => {
    const Icon = window.LucideIcon;
    const [confirmId, setConfirmId] = React.useState(null);
    const [showAll, setShowAll] = React.useState(false);

    // Cálculos de métricas
    const totalRevenue = services.reduce((acc, s) => acc + Number(s.price), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    const netProfit = totalRevenue - totalExpenses;
    const avgTicket = services.length > 0 ? (totalRevenue / services.length).toFixed(2) : 0;

    // Agrupar servicios por nombre para ver los más populares
    const servicePopularity = services.reduce((acc, s) => {
        acc[s.service] = (acc[s.service] || 0) + 1;
        return acc;
    }, {});

    const topServices = Object.entries(servicePopularity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const allMovements = [...services, ...expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const visibleMovements = showAll ? allMovements : allMovements.slice(0, 8);

    const handleDelete = (id) => {
        if (onDeleteService) onDeleteService(id);
        setConfirmId(null);
    };

    return (
        <div className="space-y-8 fade-in">
            {/* Fila de Tarjetas Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Ingresos Totales" 
                    value={`$${totalRevenue.toLocaleString()}`} 
                    icon="trending-up" 
                    color="text-emerald-400"
                    trend={`${services.length} ventas`}
                />
                <StatCard 
                    title="Gastos Totales" 
                    value={`$${totalExpenses.toLocaleString()}`} 
                    icon="trending-down" 
                    color="text-rose-400"
                    trend="Insumos y fijos"
                />
                <StatCard 
                    title="Ganancia Neta" 
                    value={`$${netProfit.toLocaleString()}`} 
                    icon="dollar-sign" 
                    color="text-blue-400"
                    trend="Bruto"
                />
                <StatCard 
                    title="Ticket Promedio" 
                    value={`$${Number(avgTicket).toLocaleString()}`} 
                    icon="shopping-bag" 
                    color="text-amber-400"
                    trend="Por cliente"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Servicios */}
                <div className="lg:col-span-1 glass-card p-8 border-white/5">
                    <h3 className="text-sm font-black uppercase text-slate-500 tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Icon name="award" size={16} className="text-blue-500" />
                        Top Servicios
                    </h3>
                    <div className="space-y-6">
                        {topServices.length > 0 ? topServices.map(([name, count], index) => (
                            <div key={name} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-xl font-black italic text-slate-700">0{index + 1}</span>
                                    <div>
                                        <p className="font-bold text-slate-200">{name}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{count} Realizados</p>
                                    </div>
                                </div>
                                <div className="w-12 h-1 bg-blue-600/20 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500" 
                                        style={{ width: `${(count / services.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-xs text-slate-600 italic">No hay datos suficientes</p>
                        )}
                    </div>
                </div>

                {/* Gráfico Comparativo */}
                <div className="lg:col-span-2 glass-card p-8 border-white/5 relative overflow-hidden">
                    <h3 className="text-sm font-black uppercase text-slate-500 tracking-[0.2em] mb-6">Comparativa Ingresos vs Gastos</h3>
                    <div className="flex items-end gap-4 h-48 mt-10">
                        <div className="flex-1 flex flex-col items-center gap-3 group">
                            <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-t-xl transition-all group-hover:bg-emerald-500/20 relative" style={{ height: '80%' }}>
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    ${totalRevenue.toLocaleString()}
                                </span>
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase">Ingresos</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-3 group">
                            <div className="w-full bg-rose-500/10 border border-rose-500/20 rounded-t-xl transition-all group-hover:bg-rose-500/20 relative" style={{ height: `${(totalExpenses / (totalRevenue || 1)) * 80}%`, minHeight: '10%' }}>
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    ${totalExpenses.toLocaleString()}
                                </span>
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase">Gastos</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-3 group">
                            <div className="w-full bg-blue-500/10 border border-blue-500/20 rounded-t-xl transition-all group-hover:bg-blue-500/20 relative" style={{ height: `${(netProfit / (totalRevenue || 1)) * 80}%`, minHeight: '5%' }}>
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    ${netProfit.toLocaleString()}
                                </span>
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase">Ganancia</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de Movimientos con opción de eliminar ventas */}
            <div className="glass-card p-8 border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black uppercase text-slate-500 tracking-[0.2em]">
                        Historial de Movimientos
                    </h3>
                    <span className="text-[10px] font-black text-slate-600 uppercase bg-white/5 px-3 py-1 rounded-lg">
                        {allMovements.length} registros
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5">
                                <th className="pb-4">Fecha</th>
                                <th className="pb-4">Concepto</th>
                                <th className="pb-4">Categoría</th>
                                <th className="pb-4 text-right">Monto</th>
                                <th className="pb-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs font-bold">
                            {visibleMovements.length > 0 ? visibleMovements.map((item, i) => {
                                const isService = !!item.price;
                                const isConfirming = confirmId === item.id;

                                return (
                                    <tr key={item.id || i} className="border-b border-white/5 last:border-0 group hover:bg-white/[0.02] transition-all">
                                        <td className="py-4 text-slate-500">
                                            {new Date(item.date).toLocaleDateString('es-AR')}
                                        </td>
                                        <td className="py-4 text-slate-200 font-bold">
                                            {item.client || item.detail}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded text-[9px] uppercase ${isService ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {item.service || item.category}
                                            </span>
                                        </td>
                                        <td className={`py-4 text-right font-black ${isService ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {isService ? `+$${Number(item.price).toLocaleString()}` : `-$${Number(item.amount).toLocaleString()}`}
                                        </td>
                                        <td className="py-4 text-right">
                                            {isService && (
                                                isConfirming ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-[9px] text-slate-400 uppercase font-black">¿Seguro?</span>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-black uppercase rounded-lg transition-all"
                                                        >
                                                            Sí
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmId(null)}
                                                            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white text-[9px] font-black uppercase rounded-lg transition-all"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmId(item.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                                        title="Eliminar venta"
                                                    >
                                                        <Icon name="trash-2" size={15} />
                                                    </button>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-600 text-xs font-black uppercase italic">
                                        Sin movimientos registrados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {allMovements.length > 8 && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20"
                        >
                            {showAll ? 'Ver menos' : `Ver todos (${allMovements.length})`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color, trend }) => {
    const Icon = window.LucideIcon;
    return (
        <div className="glass-card p-6 border-white/5 hover:scale-[1.02] transition-transform cursor-default">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-white/5 ${color}`}>
                    <Icon name={icon} size={20} />
                </div>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter bg-white/5 px-2 py-1 rounded-lg">
                    {trend}
                </span>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
            <h4 className="text-2xl font-black italic tracking-tighter text-white">{value}</h4>
        </div>
    );
};
