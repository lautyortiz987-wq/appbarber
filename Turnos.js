/**
 * TurnosModule - Gestión de Agenda e Ingresos
 * Versión mejorada basada en tu diseño anterior de alto rendimiento.
 */
window.TurnosModule = ({ appointments = [], onAdd, onDelete, onComplete }) => {
    const Icon = window.LucideIcon;
    const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = React.useState('');
    
    const initialState = {
        client: '',
        phone: '', 
        time: '',
        service: 'Corte Clásico',
        price: '', 
        date: selectedDate
    };

    const [form, setForm] = React.useState(initialState);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Sincronizar la fecha del formulario si cambia la selección global
    React.useEffect(() => {
        setForm(prev => ({ ...prev, date: selectedDate }));
    }, [selectedDate]);

    // Estadísticas para el panel lateral
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
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (isSubmitting) return;
        if (!form.client.trim() || !form.time || !form.price) return;

        setIsSubmitting(true);
        try {
            const newAppointment = {
                id: Date.now().toString(), 
                client: form.client.trim(),
                phone: form.phone.trim(),
                time: form.time,
                service: form.service,
                price: parseFloat(form.price),
                date: form.date,
                status: 'pending'
            };

            if (onAdd) {
                await onAdd(newAppointment);
            }
            
            // Reset manteniendo la fecha actual
            setForm({ 
                ...initialState, 
                date: form.date,
                client: '',
                phone: '',
                time: '',
                price: ''
            });
        } catch (error) {
            console.error("Error al agendar:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const dailyAppointments = appointments
        .filter(a => a.date === selectedDate)
        .filter(a => a.client.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.time.localeCompare(b.time));

    const sendWhatsApp = (app) => {
        const message = `Hola ${app.client}! Te recordamos tu turno en la barbería para el día ${app.date} a las ${app.time}hs. ¡Te esperamos!`;
        const phone = app.phone.replace(/\D/g, '');
        if (!phone) return;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in">
            {/* PANEL IZQUIERDO: FORMULARIO (Basado en tu versión anterior) */}
            <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-8 border-blue-500/10 shadow-xl shadow-blue-900/10 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
                            <Icon name="calendar-days" size={20} />
                        </div>
                        <h3 className="text-xl font-extrabold italic tracking-tight text-white">Agendar</h3>
                    </div>

                    <form className="space-y-4" onSubmit={handleAddAppointment}>
                        <div>
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
                        <div>
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
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">WhatsApp</label>
                            <input 
                                className="w-full p-4 rounded-2xl mt-1 font-bold outline-none bg-slate-950/50 border border-white/5 text-white"
                                placeholder="Ej: 54911..."
                                value={form.phone}
                                onChange={e => setForm({...form, phone: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Precio</label>
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
                                className="w-full p-4 rounded-2xl mt-1 font-bold outline-none bg-slate-950/50 border border-white/5 text-white text-sm"
                                value={form.service}
                                onChange={e => setForm({...form, service: e.target.value})}
                            >
                                <option>Corte Clásico</option>
                                <option>Degradé / Fade</option>
                                <option>Barba / Perfilado</option>
                                <option>Combo Full</option>
                            </select>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all text-white shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Guardando...' : 'Reservar Turno'}
                        </button>
                    </form>
                </div>

                {/* Caja del día */}
                <div className="glass-card p-6 border-emerald-500/10 bg-emerald-500/5 rounded-3xl">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Resumen Hoy</p>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs text-slate-400 font-bold mb-1">Cobrado:</p>
                            <p className="text-3xl font-black text-white italic tracking-tighter">${stats.realIncome}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-500 uppercase">Restante: ${stats.projectedIncome - stats.realIncome}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* PANEL DERECHO: LISTADO (Estilo tu versión anterior con mejoras) */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center px-2">
                    <div>
                        <h3 className="text-slate-100 font-extrabold text-2xl italic tracking-tight uppercase">Agenda del Día</h3>
                        <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1">
                            {new Date(selectedDate + "T12:00:00").toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                                type="text"
                                placeholder="Buscar..."
                                className="bg-slate-900/50 border border-white/5 rounded-xl py-1.5 pl-8 pr-4 text-xs font-bold text-white outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full uppercase">
                            {dailyAppointments.length} Turnos
                        </span>
                    </div>
                </div>

                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
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
                                <div className="h-10 w-[1px] bg-white/10 hidden md:block"></div>
                                <div>
                                    <h4 className="font-extrabold text-lg text-slate-100 leading-none flex items-center gap-2">
                                        {app.client}
                                        {app.status === 'completed' && <Icon name="check-circle" size={14} className="text-emerald-500" />}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-2">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Icon name="scissors" size={12} className="text-blue-500" />
                                            {app.service}
                                        </p>
                                        <span className="text-xs font-black text-emerald-500">${app.price}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {app.status !== 'completed' && (
                                    <>
                                        {app.phone && (
                                            <button 
                                                onClick={() => sendWhatsApp(app)}
                                                className="p-3 text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-2xl transition-all"
                                            >
                                                <Icon name="message-circle" size={20} />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => onComplete && onComplete(app)}
                                            className="p-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-2xl transition-all"
                                            title="Cobrar"
                                        >
                                            <Icon name="dollar-sign" size={20} />
                                        </button>
                                    </>
                                )}
                                
                                <button 
                                    onClick={() => onDelete && onDelete(app.id)}
                                    className="p-3 text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                                >
                                    <Icon name="trash-2" size={20} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="glass-card p-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-800 bg-transparent rounded-3xl">
                            <Icon name="calendar-x" size={48} className="text-slate-800 mb-4" />
                            <p className="text-slate-600 font-black uppercase italic tracking-widest text-sm">Sin turnos para hoy</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
