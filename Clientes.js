/**
 * ClientesModule - Gestión de Clientes
 * Módulo para registrar, buscar y gestionar la base de datos de clientes.
 */
window.ClientesModule = ({ clients, setClients }) => {
    const Icon = window.LucideIcon;
    const [searchTerm, setSearchTerm] = React.useState('');
    const [form, setForm] = React.useState({ 
        name: '', 
        phone: '', 
        notes: '' 
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.phone) return;
        
        const newClient = {
            id: Date.now(),
            ...form,
            lastVisit: 'Sin visitas aún',
            totalVisits: 0
        };
        
        setClients([newClient, ...clients]);
        setForm({ name: '', phone: '', notes: '' });
    };

    const deleteClient = (id) => {
        setClients(clients.filter(c => c.id !== id));
    };

    // Filtrado de búsqueda
    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.phone.includes(searchTerm)
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in">
            {/* Columna Izquierda: Registro de Cliente */}
            <div className="lg:col-span-1">
                <div className="glass-card p-8 sticky top-8 border-blue-500/10 shadow-xl shadow-blue-900/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
                            <Icon name="user-plus" size={20} />
                        </div>
                        <h3 className="text-xl font-extrabold italic tracking-tight text-white">Nuevo Cliente</h3>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">
                                Nombre Completo
                            </label>
                            <input 
                                className="w-full p-4 rounded-2xl mt-1 font-bold outline-none transition-all focus:ring-2 focus:ring-blue-500/50 bg-slate-900/50 border border-white/5 text-white" 
                                value={form.name} 
                                onChange={e => setForm({...form, name: e.target.value})} 
                                placeholder="Ej: Carlos Gómez"
                                required 
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">
                                Teléfono / WhatsApp
                            </label>
                            <input 
                                className="w-full p-4 rounded-2xl mt-1 font-bold outline-none transition-all focus:ring-2 focus:ring-blue-500/50 bg-slate-900/50 border border-white/5 text-white" 
                                value={form.phone} 
                                onChange={e => setForm({...form, phone: e.target.value})} 
                                placeholder="Ej: +54 9 11..."
                                required 
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">
                                Notas o Preferencias
                            </label>
                            <textarea 
                                className="w-full p-4 rounded-2xl mt-1 font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500/50 bg-slate-900/50 border border-white/5 text-white min-h-[100px] resize-none" 
                                value={form.notes} 
                                onChange={e => setForm({...form, notes: e.target.value})} 
                                placeholder="Ej: Prefiere degradé alto, usa mucha cera..."
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-lg shadow-blue-900/40 active:scale-[0.98] text-white"
                        >
                            Guardar Cliente
                        </button>
                    </form>
                </div>
            </div>
            
            {/* Columna Derecha: Listado y Búsqueda */}
            <div className="lg:col-span-2 space-y-6">
                {/* Barra de Búsqueda */}
                <div className="glass-card p-4 flex items-center gap-4 border-white/5">
                    <Icon name="search" className="text-slate-500 ml-2" size={20} />
                    <input 
                        type="text"
                        placeholder="Buscar por nombre o teléfono..."
                        className="bg-transparent border-none outline-none w-full font-bold text-slate-200 placeholder:text-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex justify-between items-end px-2">
                    <h3 className="text-slate-500 font-black uppercase tracking-widest text-[10px]">
                        Base de Datos
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {filteredClients.length} Clientes encontrados
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredClients.length > 0 ? (
                        filteredClients.map(client => (
                            <div key={client.id} className="glass-card p-6 group hover:bg-white/[0.05] transition-all border-white/5 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center font-black text-xl">
                                        {client.name.charAt(0)}
                                    </div>
                                    <button 
                                        onClick={() => deleteClient(client.id)}
                                        className="text-slate-600 hover:text-rose-500 p-2 transition-colors"
                                    >
                                        <Icon name="user-minus" size={16} />
                                    </button>
                                </div>
                                
                                <div className="relative z-10">
                                    <h4 className="font-extrabold text-lg text-white leading-none">{client.name}</h4>
                                    <p className="text-blue-400 font-bold text-xs mt-2 flex items-center gap-2">
                                        <Icon name="phone" size={12} />
                                        {client.phone}
                                    </p>
                                    
                                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold uppercase">
                                            <span className="text-slate-500">Última Visita</span>
                                            <span className="text-slate-300">{client.lastVisit}</span>
                                        </div>
                                        {client.notes && (
                                            <p className="text-[10px] text-slate-500 italic mt-2 bg-slate-950/30 p-2 rounded-lg">
                                                "{client.notes}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Decoración de fondo */}
                                <Icon name="users" size={80} className="absolute -right-6 -bottom-6 opacity-[0.03] text-white" />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full glass-card p-20 text-center flex flex-col items-center justify-center border-dashed border-slate-700 bg-transparent">
                            <Icon name="users" size={48} className="text-slate-800 mb-4" />
                            <p className="text-slate-600 font-black uppercase italic tracking-widest text-sm">No se encontraron clientes</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
