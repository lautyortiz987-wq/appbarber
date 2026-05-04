/**
 * TurnosModule - Gestión de Agenda e Ingresos
 * Incluye sincronización de precios, estados de cobro y validación de horarios.
 */
window.TurnosModule = ({ appointments = [], onAdd, onDelete, onComplete }) => {
    const Icon = window.LucideIcon;
    const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
    
    const initialState = {
        client: '',
        phone: '', // Agregado para contacto
        time: '',
        service: 'Corte Clásico',
        price: '', 
        date: selectedDate
    };

    const [form, setForm] = React.useState(initialState);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Cálculos de ingresos del día seleccionado
    const stats = React.useMemo(() => {
        const dayApps = appointments.filter(a => a.date === selectedDate);
        return {
            total: dayApps.length,
            completed: dayApps.filter(a => a.status === 'completed').length,
            projectedIncome: dayApps.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0),
            realIncome: dayApps.filter(a => a.status === 'completed')
                               .reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0)
        };
    }, [appointments, selectedDate]);

    const handleAddAppointment = async (e) => {
        if (e) e.preventDefault();
        
        // Validación de campos
        if (!form.client || !form.time || !form.price) {
            return;
        }

        // Validación de conflicto de horario
        const hasConflict = appointments.some(a => a.date === form.date && a.time === form.time);
        if (hasConflict) {
            if (!confirm("Ya existe un turno a esa hora. ¿Deseas agendarlo igualmente?")) return;
        }

        setIsSubmitting(true);
        try {
            if (onAdd) {
                await onAdd({
                    id: Date.now(),
                    client: form.client.trim(),
                    phone: form.phone.trim(),
                    time: form.time,
                    service: form.service,
                    price: parseFloat(form.price),
                    date: form.date,
                    status: 'pending'
                });
            }
            // Reset manteniendo la fecha
            setForm({ ...initialState, date: selectedDate });
        } catch (error) {
            console.error("Error al agendar:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const dailyAppointments = appointments
        .filter(a => a.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in">
            {/* PANEL IZQUIERDO: FORMULARIO */}
            <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-8 border-blue-500/10 shadow-xl shadow-blue-900/10 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
                            <Icon name="calendar-plus" size={20} />
                        </div>
                        <h3 className="text-xl font-extrabold italic tracking-tight text-white">Nuevo Turno</h3>
                    </div>

                    <form className="space-y-4" onSubmit={handleAddAppointment}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Fecha</label>
                                <input 
                                    type="date" 
                                    className="w-full p-4 rounded-2xl mt-1 font-bold outline-none bg-slate-950/50 border border-white/5 text-white focus:ring-2 focus:ring-blue-500/50"
                                    value={form.date}
                                    onChange={e => {
                                        setForm({...form, date: e.target.value});
                                        setSelectedDate(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Cliente</label>
                                <input 
                                    className="w-full p-4 rounded-2xl mt-1 font-bold outline-none bg-slate-950/50 border border-white/5 text-white"
                                    placeholder="Nombre del cliente"
                                    value={form.client}
                                    onChange={e => setForm({...form, client: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Hora</label>
                                <input 
                                    type="time" 
                                    className="w-full p-4 rounded-2xl mt-1 font-bold outline-none bg-slate-950/50 border border-white/5 text-white"
                                    value={form.time}
                                    onChange={e => setForm({...form, time: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Precio ($)</label>
                                <input 
                                    type="number" 
                                    className="w-full p-4 rounded-2xl mt-1 font-black outline-none bg-slate-950/50 border border-white/5 text-emerald-400"
                                    placeholder="0"
                                    value={form.price}
                                    onChange={e => setForm({...form, price: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Servicio</label>
                            <select 
                                className="w-full p-4 rounded-2xl mt-1 font-bold outline-none bg-slate-950/50 border border-white/5 text-white text-sm appearance-none cursor-pointer"
                                value={form.service}
                                onChange={e => setForm({...form, service: e.target.value})}
                            >
                                <option value="Corte Clásico">Corte Clásico</option>
                                <option value="Degradé / Fade">Degradé / Fade</option>
                                <option value="Barba / Perfilado">Barba / Perfilado</option>
                                <option value="Corte + Barba">Corte + Barba</option>
                                <option value="Tratamiento Capilar">Tratamiento Capilar</option>
                            </select>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all text-white shadow-lg shadow-blue-900/40 active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
                        </button>
                    </form>
                </div>

                {/* Mini Stats Card */}
                <div className="glass-card p-6 border-emerald-500/10 bg-emerald-500/5 rounded-3xl">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Resumen Financiero Hoy</p>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs text-slate-400 font-bold">Proyectado: ${stats.projectedIncome}</p>
                            <p className="text-2xl font-black text-white italic">${stats.realIncome}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Cobrado</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* PANEL DERECHO: LISTADO */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center px-2">
                    <div>
                        <h3 className="text-slate-100 font-extrabold text-2xl italic tracking-tight uppercase">Agenda de Hoy</h3>
                        <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1">
                            {new Date(selectedDate + "T12:00:00").toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="text-right px-4 border-r border-white/10">
                            <p className="text-[8px] font-black text-slate-500 uppercase">Pendientes</p>
                            <p className="text-lg font-black text-white">{stats.total - stats.completed}</p>
                        </div>
                        <div className="text-right px-2">
                            <p className="text-[8px] font-black text-emerald-500 uppercase">Listos</p>
                            <p className="text-lg font-black text-emerald-500">{stats.completed}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 no-scrollbar">
                    {dailyAppointments.length > 0 ? dailyAppointments.map(app => (
                        <div key={app.id} 
                             className={`glass-card p-6 flex justify-between items-center group transition-all border rounded-3xl ${
                                app.status === 'completed' 
                                ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' 
                                : 'bg-slate-900/30 border-white/5 hover:border-blue-500/30'
                             }`}>
                            <div className="flex items-center gap-6">
                                <div className="text-center min-w-[70px]">
                                    <p className={`text-2xl font-black italic leading-none ${app.status === 'completed' ? 'text-emerald-400' : 'text-white'}`}>
                                        {app.time}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">HS</p>
                                </div>
                                <div className="h-12 w-[1px] bg-white/10 hidden md:block"></div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-extrabold text-lg text-slate-100 leading-none">{app.client}</h4>
                                        {app.status === 'completed' && <Icon name="check-circle" size={14} className="text-emerald-500" />}
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-[9px] font-black text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                            <Icon name="scissors" size={10} /> {app.service}
                                        </span>
                                        <span className="text-sm font-black text-emerald-400 italic">
                                            ${parseFloat(app.price).toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {app.status !== 'completed' ? (
                                    <button 
                                        onClick={() => onComplete && onComplete(app)}
                                        className="flex flex-col items-center gap-1 p-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-2xl transition-all group/btn shadow-lg"
                                        title="Cobrar Turno"
                                    >
                                        <Icon name="dollar-sign" size={20} className="group-hover/btn:scale-110 transition-transform" />
                                        <span className="text-[8px] font-black uppercase">Cobrar</span>
                                    </button>
                                ) : (
                                    <div className="px-4 py-2 bg-emerald-500/20 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-tighter">
                                        PAGADO
                                    </div>
                                )}
                                
                                <button 
                                    onClick={() => onDelete && onDelete(app.id)}
                                    className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                                >
                                    <Icon name="trash-2" size={20} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="glass-card p-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-800 bg-transparent rounded-3xl">
                            <Icon name="calendar-x" size={48} className="text-slate-800 mb-4" />
                            <p className="text-slate-600 font-black uppercase italic tracking-widest text-sm">No hay citas para hoy</p>
                            <p className="text-slate-700 text-[10px] mt-2 font-bold">¡Buen momento para limpiar las máquinas!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
