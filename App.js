/**
 * Orquestador Barber Pro v2.8 (GitHub DB Edition)
 * Sistema Integral: Gestión de Turnos, Historial, Clientes y Finanzas.
 */
const { useState, useEffect, useCallback, useRef } = React;

// --- CONFIGURACIÓN DE GITHUB ---
const GITHUB_CONFIG = { 
    token: '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', 
    owner: 'lautyortiz987-wq', 
    repo: 'appbarber',  
    path: 'database.json', 
    branch: 'main'
};

window.LucideIcon = ({ name, size = 20, className = "" }) => {
    useEffect(() => {
        if (window.lucide) window.lucide.createIcons();
    }, [name]);
    return <i data-lucide={name} className={className} style={{ width: size, height: size }}></i>;
};

const App = () => {
    const [activeTab, setActiveTab] = useState('resumenes');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const isInitialMount = useRef(true);
    
    const [data, setData] = useState({
        historial: [],
        gastos: [],
        clientes: [],
        turnos: []
    });

    const Icon = window.LucideIcon;

    // --- COMUNICACIÓN CON GITHUB ---

    const loadFromGitHub = useCallback(async () => {
        if (!GITHUB_CONFIG.token || !GITHUB_CONFIG.owner) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}?ref=${GITHUB_CONFIG.branch}`,
                { headers: { Authorization: `token ${GITHUB_CONFIG.token}`, 'Cache-Control': 'no-cache' } }
            );
            if (response.ok) {
                const result = await response.json();
                const content = JSON.parse(atob(result.content));
                setData({
                    historial: content.historial || [],
                    gastos: content.gastos || [],
                    clientes: content.clientes || [],
                    turnos: content.turnos || []
                });
                window._github_sha = result.sha;
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveToGitHub = async (newData) => {
        if (!GITHUB_CONFIG.token || saving) return;
        setSaving(true);
        try {
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(newData, null, 2))));
            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `token ${GITHUB_CONFIG.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: `Auto-Sync: ${new Date().toLocaleString()}`,
                        content: content,
                        sha: window._github_sha,
                        branch: GITHUB_CONFIG.branch
                    })
                }
            );
            if (response.ok) {
                const result = await response.json();
                window._github_sha = result.content.sha;
            } else {
                // Si hay conflicto de SHA, intentar recargar
                loadFromGitHub();
            }
        } catch (error) {
            console.error("Error al guardar en la nube:", error);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        loadFromGitHub();
    }, [loadFromGitHub]);

    const updateData = (key, newValue) => {
        const newData = { ...data, [key]: newValue };
        setData(newData);
        saveToGitHub(newData);
    };

    // --- PROCESAMIENTO DE NEGOCIO ---

    const handleCompleteTurno = (turno) => {
        if (turno.status === 'completed') return;

        // 1. Actualizar estado del turno
        const turnosActualizados = data.turnos.map(t => 
            t.id === turno.id ? { ...t, status: 'completed' } : t
        );

        // 2. Registrar en Historial
        const nuevoServicio = {
            id: Date.now(),
            client: turno.client,
            service: turno.service,
            price: parseFloat(turno.price || 0),
            date: new Date().toISOString(),
            isFromTurno: true
        };
        const historialActualizado = [nuevoServicio, ...(data.historial || [])];

        // 3. Actualizar o crear Cliente automáticamente
        let clientesActualizados = [...(data.clientes || [])];
        const clienteIndex = clientesActualizados.findIndex(c => 
            c.name.toLowerCase() === turno.client.toLowerCase()
        );

        if (clienteIndex !== -1) {
            clientesActualizados[clienteIndex] = {
                ...clientesActualizados[clienteIndex],
                visits: (clientesActualizados[clienteIndex].visits || 0) + 1,
                lastVisit: new Date().toISOString()
            };
        } else {
            clientesActualizados.push({
                id: Date.now() + 1,
                name: turno.client,
                phone: turno.phone || '',
                visits: 1,
                lastVisit: new Date().toISOString()
            });
        }

        const estadoFinal = {
            ...data,
            turnos: turnosActualizados,
            historial: historialActualizado,
            clientes: clientesActualizados
        };

        setData(estadoFinal);
        saveToGitHub(estadoFinal);
    };

    const renderModule = () => {
        if (loading) return (
            <div className="flex flex-col items-center justify-center py-40">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 animate-pulse">Sincronizando Base de Datos</p>
            </div>
        );

        const commonProps = {
            services: data.historial || [],
            expenses: data.gastos || [],
            clients: data.clientes || []
        };

        switch(activeTab) {
            case 'resumenes':
                return window.DashboardModule ? <window.DashboardModule {...commonProps} /> : null;
            case 'historial':
                return window.HistorialModule ? <window.HistorialModule {...commonProps} /> : null;
            case 'gasto':
                return window.GastosModule ? 
                    <window.GastosModule 
                        expenses={data.gastos} 
                        onAdd={(e) => updateData('gastos', [e, ...data.gastos])}
                        onDelete={(id) => updateData('gastos', data.gastos.filter(x => x.id !== id))}
                    /> : null;
            case 'clientes':
                return window.ClientesModule ? 
                    <window.ClientesModule 
                        clients={data.clientes} 
                        setClients={(c) => updateData('clientes', c)} 
                    /> : null;
            case 'turnos':
                return window.TurnosModule ? 
                    <window.TurnosModule 
                        appointments={data.turnos || []}
                        onAdd={(nuevo) => updateData('turnos', [nuevo, ...(data.turnos || [])])}
                        onDelete={(id) => updateData('turnos', data.turnos.filter(t => t.id !== id))}
                        onComplete={handleCompleteTurno}
                    /> : null;
            default: return null;
        }
    };

    const balanceTotal = ((data.historial || []).reduce((a, b) => a + Number(b.price || 0), 0) - (data.gastos || []).reduce((a, b) => a + Number(b.amount || 0), 0));

    return (
        <div className="flex min-h-screen relative bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Sidebar con efecto Glassmorphism */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950/60 backdrop-blur-xl border-r border-white/5 transition-transform duration-500 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-10 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-14">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-3">
                            <Icon name="scissors" className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="font-black text-2xl italic tracking-tighter uppercase leading-none text-white">Barber</h1>
                            <p className="text-[10px] font-black tracking-[0.4em] text-blue-500 uppercase mt-1">Professional</p>
                        </div>
                    </div>

                    <nav className="space-y-2 flex-1">
                        <NavItem active={activeTab === 'resumenes'} icon="layout-dashboard" label="Resúmenes" onClick={() => {setActiveTab('resumenes'); setSidebarOpen(false);}} />
                        <NavItem active={activeTab === 'historial'} icon="bar-chart-3" label="Estadísticas" onClick={() => {setActiveTab('historial'); setSidebarOpen(false);}} />
                        <NavItem active={activeTab === 'gasto'} icon="wallet" label="Gastos" onClick={() => {setActiveTab('gasto'); setSidebarOpen(false);}} />
                        <NavItem active={activeTab === 'clientes'} icon="users" label="Clientes" onClick={() => {setActiveTab('clientes'); setSidebarOpen(false);}} />
                        <NavItem active={activeTab === 'turnos'} icon="calendar-days" label="Turnos" onClick={() => {setActiveTab('turnos'); setSidebarOpen(false);}} />
                    </nav>

                    <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                    <Icon name="database" size={14} className="text-blue-400" />
                                </div>
                                {saving && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-bold text-white truncate uppercase tracking-tighter">{saving ? 'Guardando...' : 'Estado Nube'}</p>
                                <p className="text-[8px] text-emerald-500 font-black uppercase mt-0.5">Sincronizado</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {sidebarOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

            <main className="flex-1 lg:ml-72 p-6 lg:p-12 min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950">
                <header className="flex justify-between items-center mb-16 relative z-10">
                    <button className="lg:hidden p-4 bg-white/5 rounded-2xl border border-white/10 text-white" onClick={() => setSidebarOpen(true)}>
                        <Icon name="menu" size={24} />
                    </button>
                    
                    <div className="hidden lg:block">
                        <h2 className="text-[10px] font-black uppercase text-blue-500 tracking-[0.5em] mb-2">Cloud Management System</h2>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${saving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                            <p className="text-slate-100 font-extrabold text-lg italic tracking-tight capitalize">{activeTab}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex flex-col text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Balance Disponible</p>
                            <p className={`font-black italic text-2xl ${balanceTotal >= 0 ? 'text-white' : 'text-rose-500'}`}>
                                ${balanceTotal.toLocaleString()}
                            </p>
                        </div>
                        <button 
                            onClick={loadFromGitHub} 
                            disabled={loading}
                            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer active:scale-90"
                        >
                            <Icon name="refresh-cw" size={20} className={`${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto w-full flex-1 relative">
                    {renderModule()}
                </div>
                
                <footer className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
                    <p>Barber Pro Enterprise © 2024</p>
                    <p className="text-blue-500/50">Infraestructura GitHub API v3</p>
                </footer>
            </main>
        </div>
    );
};

const NavItem = ({ active, icon, label, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-5 p-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.1em] transition-all duration-300 group ${active ? 'bg-gradient-to-r from-blue-600/20 to-transparent text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'}`}>
        <window.LucideIcon name={icon} size={18} className={active ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'} />
        {label}
    </button>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
