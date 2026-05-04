/**
 * Orquestador Barber Pro v2.6 (GitHub DB Edition)
 * Persistencia de datos mediante JSON en GitHub API.
 */
const { useState, useEffect, useCallback } = React;

// --- CONFIGURACIÓN DE GITHUB ---
// Debes completar estos datos para que la persistencia funcione
const GITHUB_CONFIG = {
    token: '', // Tu Personal Access Token de GitHub
    owner: '', // Tu usuario de GitHub
    repo: '',  // Nombre del repositorio
    path: 'database.json', // Nombre del archivo .json en el repo
    branch: 'main'
};

// Helper global para iconos Lucide
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
    
    // Estado Centralizado - Mapeado a las claves de tu database.json
    const [data, setData] = useState({
        historial: [],
        gastos: [],
        clientes: [],
        turnos: []
    });

    const Icon = window.LucideIcon;

    // --- LÓGICA DE GITHUB API ---

    // Cargar datos desde GitHub
    const loadFromGitHub = useCallback(async () => {
        if (!GITHUB_CONFIG.token || !GITHUB_CONFIG.owner) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}?ref=${GITHUB_CONFIG.branch}`,
                {
                    headers: { Authorization: `token ${GITHUB_CONFIG.token}` }
                }
            );

            if (response.ok) {
                const result = await response.json();
                const content = JSON.parse(atob(result.content)); // Decodificar Base64
                setData(content);
                // Guardar el SHA para futuras actualizaciones
                window._github_sha = result.sha;
            }
        } catch (error) {
            console.error("Error cargando desde GitHub:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Guardar datos en GitHub
    const saveToGitHub = async (newData) => {
        if (!GITHUB_CONFIG.token) return;
        setSaving(true);

        try {
            const content = btoa(JSON.stringify(newData, null, 2)); // Convertir a Base64
            
            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `token ${GITHUB_CONFIG.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: `Update database: ${new Date().toLocaleString()}`,
                        content: content,
                        sha: window._github_sha, // Necesario para actualizar
                        branch: GITHUB_CONFIG.branch
                    })
                }
            );

            if (response.ok) {
                const result = await response.json();
                window._github_sha = result.content.sha; // Actualizar SHA
            }
        } catch (error) {
            console.error("Error guardando en GitHub:", error);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        loadFromGitHub();
    }, [loadFromGitHub]);

    // Handlers de actualización de estado
    const updateData = (key, newValue) => {
        const newData = { ...data, [key]: newValue };
        setData(newData);
        saveToGitHub(newData);
    };

    const renderModule = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Conectando con GitHub...</p>
                </div>
            );
        }

        const props = {
            services: data.historial || [],
            expenses: data.gastos || [],
            clients: data.clientes || []
        };

        switch(activeTab) {
            case 'resumenes':
                return window.DashboardModule ? <window.DashboardModule {...props} /> : <div className="text-center py-20 italic text-slate-500">Cargando Resúmenes...</div>;
            case 'historial':
                return window.HistorialModule ? <window.HistorialModule {...props} /> : <div className="text-center py-20 italic text-slate-500">Cargando Estadísticas...</div>;
            case 'gasto':
                return window.GastosModule ? 
                    <window.GastosModule 
                        expenses={data.gastos} 
                        onAdd={(e) => updateData('gastos', [e, ...data.gastos])}
                        onDelete={(id) => updateData('gastos', data.gastos.filter(x => x.id !== id))}
                    /> : <div className="text-center py-20 italic text-slate-500">Cargando Gastos...</div>;
            case 'clientes':
                return window.ClientesModule ? 
                    <window.ClientesModule 
                        clients={data.clientes} 
                        setClients={(c) => updateData('clientes', c)} 
                    /> : <div className="text-center py-20 italic text-slate-500">Cargando Clientes...</div>;
            case 'turnos':
                return window.TurnosModule ? 
                    <window.TurnosModule 
                        appointments={data.turnos || []}
                        setAppointments={(a) => updateData('turnos', a)}
                    /> : <div className="text-center py-20 italic text-slate-500">Cargando Agenda...</div>;
            default: return null;
        }
    };

    const balanceTotal = ((data.historial || []).reduce((a, b) => a + Number(b.price || 0), 0) - (data.gastos || []).reduce((a, b) => a + Number(b.amount || 0), 0));

    return (
        <div className="flex min-h-screen relative bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950/40 backdrop-blur-2xl border-r border-white/5 transition-transform duration-500 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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

                    <nav className="space-y-3 flex-1">
                        <NavItem active={activeTab === 'resumenes'} icon="layout-dashboard" label="Resúmenes" onClick={() => {setActiveTab('resumenes'); setSidebarOpen(false);}} />
                        <NavItem active={activeTab === 'historial'} icon="bar-chart-3" label="Estadísticas" onClick={() => {setActiveTab('historial'); setSidebarOpen(false);}} />
                        <NavItem active={activeTab === 'gasto'} icon="wallet" label="Gastos" onClick={() => {setActiveTab('gasto'); setSidebarOpen(false);}} />
                        <NavItem active={activeTab === 'clientes'} icon="users" label="Clientes" onClick={() => {setActiveTab('clientes'); setSidebarOpen(false);}} />
                        <NavItem active={activeTab === 'turnos'} icon="calendar-days" label="Turnos" onClick={() => {setActiveTab('turnos'); setSidebarOpen(false);}} />
                    </nav>

                    <div className="mt-auto pt-10 border-t border-white/5">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-[10px]">DB</div>
                                {saving && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white leading-none">{saving ? 'Guardando...' : 'GitHub DB'}</p>
                                <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Sincronizado</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay Móvil */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)}></div>}

            {/* Contenido Principal */}
            <main className="flex-1 lg:ml-72 p-6 lg:p-12 min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950">
                <header className="flex justify-between items-center mb-16 relative z-10">
                    <button className="lg:hidden p-4 bg-white/5 rounded-2xl border border-white/10 text-white" onClick={() => setSidebarOpen(true)}>
                        <Icon name="menu" size={24} />
                    </button>
                    <div className="hidden lg:block">
                        <h2 className="text-[10px] font-black uppercase text-blue-500 tracking-[0.5em] mb-2">Base de Datos GitHub</h2>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${saving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                            <p className="text-slate-100 font-extrabold text-lg italic tracking-tight capitalize">
                                {activeTab === 'historial' ? 'Estadísticas' : activeTab}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col text-right mr-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Balance General</p>
                            <p className="text-white font-black italic text-xl">
                                ${ balanceTotal.toLocaleString() }
                            </p>
                        </div>
                        <button 
                            onClick={loadFromGitHub}
                            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer group"
                            title="Refrescar Datos"
                        >
                            <Icon name="refresh-cw" size={20} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        </button>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto w-full flex-1">
                    {!GITHUB_CONFIG.token ? (
                        <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl text-center">
                            <Icon name="alert-circle" className="text-rose-500 mx-auto mb-4" size={40} />
                            <h3 className="text-white font-black uppercase tracking-widest mb-2">Falta Configuración</h3>
                            <p className="text-slate-400 text-sm max-w-md mx-auto">
                                Para guardar datos en tu JSON de GitHub, necesitas configurar el Token y los datos del repo en el código fuente (objeto GITHUB_CONFIG).
                            </p>
                        </div>
                    ) : renderModule()}
                </div>

                <footer className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                    <p>© 2024 Barber Pro System v2.6 • GitHub Edition</p>
                    <div className="flex gap-6">
                        <span className="text-emerald-500/50">Servidor Online</span>
                    </div>
                </footer>
            </main>
        </div>
    );
};

const NavItem = ({ active, icon, label, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-5 p-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.1em] transition-all duration-300 group ${active ? 'bg-gradient-to-r from-blue-600/20 to-transparent text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'}`}>
        <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
            <window.LucideIcon name={icon} size={18} />
        </div>
        {label}
    </button>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
