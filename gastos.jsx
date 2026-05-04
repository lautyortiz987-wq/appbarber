/**
 * GastosModule - Gestión de Egresos
 * Módulo para registrar gastos operativos y de insumos de la barbería.
 */
window.GastosModule = ({ expenses = [], onAdd, onDelete }) => {
    const Icon = window.LucideIcon;
    const [form, setForm] = React.useState({ 
        detail: '', 
        amount: '', 
        category: 'Insumos' 
    });

    const handleSubmit = (e) => {
        // Prevenir el comportamiento por defecto del formulario inmediatamente
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const numericAmount = parseFloat(form.amount);
        
        if (!form.detail.trim() || isNaN(numericAmount) || numericAmount <= 0) {
            return;
        }
        
        // Ejecutar la función de agregar pasada por props
        if (onAdd) {
            onAdd({
                id: Date.now(),
                detail: form.detail.trim(),
                amount: numericAmount,
                category: form.category,
                date: new Date().toISOString()
            });
        }
        
        // Limpiar el estado local de forma segura
        setForm({ detail: '', amount: '', category: 'Insumos' });
    };

    // Cálculo del total con validación de tipo
    const totalSpent = React.useMemo(() => {
        return expenses.reduce((acc, curr) => {
            const val = parseFloat(curr.amount);
            return acc + (isNaN(val) ? 0 : val);
        }, 0);
    }, [expenses]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in">
            {/* Columna Izquierda: Formulario de Gasto */}
            <div className="lg:col-span-1">
                <div className="glass-card p-8 sticky top-8 border-rose-500/10 shadow-xl shadow-rose-900/10 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-rose-600/20 rounded-lg text-rose-400">
                            <Icon name="receipt" size={20} />
                        </div>
                        <h3 className="text-xl font-extrabold italic tracking-tight text-white">Registrar Gasto</h3>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">
                                Detalle del Egreso
                            </label>
                            <input 
                                className="w-full p-4 rounded-2xl mt-1 font-bold outline-none transition-all focus:ring-2 focus:ring-rose-500/50 bg-slate-950/50 border border-white/5 text-white" 
                                value={form.detail} 
                                onChange={e => setForm({...form, detail: e.target.value})} 
                                placeholder="Ej: Alquiler, Insumos, Luz..."
                                required 
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">
                                    Categoría
                                </label>
                                <div className="relative">
                                    <select 
                                        className="w-full p-4 rounded-2xl mt-1 font-bold appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-rose-500/50 bg-slate-950/50 border border-white/5 text-white text-sm" 
                                        value={form.category} 
                                        onChange={e => setForm({...form, category: e.target.value})}
                                    >
                                        <option>Insumos</option>
                                        <option>Servicios Públicos</option>
                                        <option>Alquiler</option>
                                        <option>Marketing</option>
                                        <option>Otros</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <Icon name="chevron-down" size={16} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">
                                    Monto ($)
                                </label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    className="w-full p-4 rounded-2xl mt-1 font-black outline-none focus:ring-2 focus:ring-rose-500/50 bg-slate-950/50 border border-white/5 text-white" 
                                    value={form.amount} 
                                    onChange={e => setForm({...form, amount: e.target.value})} 
                                    placeholder="0.00"
                                    required 
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-4 bg-rose-600 hover:bg-rose-500 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-lg shadow-rose-900/40 active:scale-[0.98] text-white"
                        >
                            Guardar Egreso
                        </button>
                    </form>
                </div>
            </div>
            
            {/* Columna Derecha: Listado de Gastos */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-end px-2 mb-2">
                    <h3 className="text-slate-500 font-black uppercase tracking-widest text-[10px]">
                        Listado de Egresos
                    </h3>
                    <div className="text-right">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Total Gastado</p>
                        <p className="text-xl font-black text-rose-500 tracking-tighter">
                            -${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {expenses && expenses.length > 0 ? (
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar pr-2">
                        {expenses.map(e => (
                            <div key={e.id} className="glass-card p-6 flex justify-between items-center group hover:bg-white/[0.05] transition-all border border-white/5 rounded-3xl bg-slate-900/20 backdrop-blur-sm">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-rose-400 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-inner">
                                        <Icon name="shopping-bag" size={24} />
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-lg leading-none text-slate-100">{e.detail}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded uppercase tracking-tighter border border-rose-500/20">
                                                {e.category}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                                                {e.date ? new Date(e.date).toLocaleDateString() : 'S/F'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-2xl font-black italic tracking-tighter text-rose-400">
                                            -${parseFloat(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => onDelete && onDelete(e.id)} 
                                        className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                    >
                                        <Icon name="trash-2" size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-800 bg-transparent rounded-3xl">
                        <Icon name="wallet" size={48} className="text-slate-800 mb-4" />
                        <p className="text-slate-600 font-black uppercase italic tracking-widest text-sm">Sin gastos registrados</p>
                        <p className="text-slate-700 text-xs mt-2 font-bold">Todo está bajo control por ahora.</p>
                    </div>
                )}
            </div>
        </div>
    );
};