/**
 * TurnosModule - Gestión de Agenda
 * Módulo para programar y visualizar las citas de la barbería.
 */
window.TurnosModule = () => {
    const Icon = window.LucideIcon;
    const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [appointments, setAppointments] = React.useState(() => {
        return JSON.parse(localStorage.getItem('br_appointments')) || [];
    });
    
    const [form, setForm] = React.useState({
        client: '',
        time: '',
        service: 'Corte Clásico',
        date: selectedDate
    });

    // Persistencia de turnos
    React.useEffect(() => {
        localStorage.setItem('br_appointments', JSON.stringify(appointments));
    }, [appointments]);

    const handleAddAppointment = (e) => {
        e.preventDefault();
        if (!form.client || !form.time) return;

        const newAppointment = {
            id: Date.now(),
            ...form,
            status: 'pending'
        };

        setAppointments([...appointments, newAppointment]);
        setForm({ ...form, client: '', time: '' });
    };

    const deleteAppointment = (id) => {
        setAppointments(appointments.filter(a => a.id !== id));
    };

    // Filtrar turnos por la fecha seleccionada
    const dailyAppointments = appointments
        .filter(a => a.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in">
            {/* Columna Izquierda: Calendario y Nuevo Turno */}
            <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-8 border-blue-500/10 shadow-xl shadow-blue-900/10">
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
                                className="w-full p-4 rounded-2xl mt-1 font-bold outline-none bg-slate-900/50 border border-white/5 text-white"
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
                                className="w-full p-4 rounded-2xl mt-1 font-bold outline-none bg-slate-900/50 border border-white/5 text-white"
                                placeholder="Nombre del cliente"
                                value={form.client}
                                onChange={e => setForm({...form, client: e.target.value})}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Hora</label>
                                <input 
                                    type="time" 
                                    className="w-full p-4 rounded-2xl mt-1 font-bold outline-none bg-slate-900/50 border border-white/5 text-white"
                                    value={form.time}
                                    onChange={e => setForm({...form, time: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Servicio</label>
                                <select 
                                    className="w-full p-4 rounded-2xl mt-1 font-bold outline-none bg-slate-900/50 border border-white/5 text-white text-sm appearance-none"
                                    value={form.service}
                                    onChange={e => setForm({...form, service: e.target.value})}
                                >
                                    <option>Corte Clásico</option>
                                    <option>Degradé / Fade</option>
                                    <option>Barba</option>
                                    <option>Combo Full</option>
                                </select>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all text-white mt-2"
                        >
                            Reservar Turno
                        </button>
                    </form>
                </div>
            </div>

            {/* Columna Derecha: Agenda del Día */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center px-2">
                    <div>
                        <h3 className="text-slate-200 font-extrabold text-xl italic tracking-tight">Agenda del Día</h3>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
                            {new Date(selectedDate + "T12:00:00").toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full uppercase">
                            {dailyAppointments.length} Turnos
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    {dailyAppointments.length > 0 ? dailyAppointments.map(app => (
                        <div key={app.id} className="glass-card p-6 flex justify-between items-center group border-white/5 hover:bg-white/[0.05] transition-all">
                            <div className="flex items-center gap-6">
                                <div className="text-center min-w-[60px]">
                                    <p className="text-2xl font-black text-white italic leading-none">{app.time}</p>
                                    <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">HS</p>
                                </div>
                                <div className="h-10 w-[1px] bg-white/10 hidden md:block"></div>
                                <div>
                                    <h4 className="font-extrabold text-lg text-slate-100 leading-none">{app.client}</h4>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-widest flex items-center gap-2">
                                        <Icon name="scissors" size={12} />
                                        {app.service}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => deleteAppointment(app.id)}
                                    className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                >
                                    <Icon name="x-circle" size={20} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="glass-card p-20 text-center flex flex-col items-center justify-center border-dashed border-slate-700 bg-transparent">
                            <Icon name="calendar-x" size={48} className="text-slate-800 mb-4" />
                            <p className="text-slate-600 font-black uppercase italic tracking-widest text-sm">Sin turnos para hoy</p>
                            <p className="text-slate-700 text-xs mt-2 font-bold">¡Relájate o agenda un nuevo cliente!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
