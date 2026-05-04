/**
 * Orquestador Barber Pro v3.1 (GitHub Cloud Persistence)
 * Centraliza el estado y asegura que los módulos secundarios
 * guarden los datos permanentemente en GitHub.
 */
const { useState, useEffect, useCallback } = React;

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
    const [activeTab, setActiveTab] = useState('turnos');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Estado único (Fuente de verdad)
    const [db, setDb] = useState({
        historial: [],
        gastos: [],
        clientes: [],
        turnos: []
    });

    const Icon = window.LucideIcon;

    // --- CARGA DESDE LA NUBE ---
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}?ref=${GITHUB_CONFIG.branch}`,
                { headers: { Authorization: `token ${GITHUB_CONFIG.token}`, 'Cache-Control': 'no-cache' } }
            );
            
            if (response.ok) {
                const result = await response.json();
                const content = JSON.parse(decodeURIComponent(escape(atob(result.content))));
                
                setDb({
                    historial: content.historial || [],
                    gastos: content.gastos || [],
                    clientes: content.clientes || [],
                    turnos: content.turnos || []
                });
                
                window._current_sha = result.sha;
            }
        } catch (error) {
            console.error("Error al cargar:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // --- GUARDADO EN LA NUBE ---
    const syncToCloud = async (newDbState) => {
        if (saving) return;
        setSaving(true);
        try {
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(newDbState, null, 2))));
            
            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `token ${GITHUB_CONFIG.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: `Update: ${new Date().toISOString()}`,
                        content: content,
                        sha: window._current_sha,
                        branch: GITHUB_CONFIG.branch
                    })
                }
            );
            
            if (response.ok) {
                const res = await response.json();
                window._current_sha = res.content.sha;
            } else {
                console.warn("Conflicto detectado, re-sincronizando...");
                await loadData();
            }
        } catch (error) {
            console.error("Error al guardar:", error);
        } finally {
            setSaving(false);
        }
    };

    // --- ACCIONES CENTRALIZADAS ---
    const addItem = (key, item) => {
        const updatedDb = { ...db, [key]: [item, ...(db[key] || [])] };
        setDb(updatedDb);
        syncToCloud(updatedDb);
    };

    const deleteItem = (key, id) => {
        const updatedDb = { ...db, [key]: db[key].filter(i => i.id !== id) };
        setDb(updatedDb);
        syncToCloud(updatedDb);
    };

    const handleCompleteTurno = (turno) => {
        const updatedTurnos = db.turnos.map(t => t.id === turno.id ? { ...t, status: 'completed' } : t);
        const newHistorial = [{
            id: Date.now(),
            client: turno.client,
            service: turno.service,
            price: turno.price,
            date: new Date().toISOString()
        }, ...db.historial];

        const updatedDb = { ...db, turnos: updatedTurnos, historial: newHistorial };
        setDb(updatedDb);
        syncToCloud(updatedDb);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#020617]">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-blue-500 font-black uppercase tracking-[0.3em] text-[10px]">Cargando Barber Pro...</p>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#020617] text-slate-200">
            {/* Sidebar con tabs corregidos */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-white/5 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-blue-600/20">
                            <Icon name="scissors" className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-black italic text-xl leading-none">BARBER</h1>
                            <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Enterprise</span>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <TabButton active={activeTab === 'turnos'} icon="calendar" label="Turnos" onClick={() => setActiveTab('turnos')} />
                        <TabButton active={activeTab === 'gasto'} icon="wallet" label="Gastos" onClick={() => setActiveTab('gasto')} />
                        <TabButton active={activeTab === 'clientes'} icon="users" label="Clientes" onClick={() => setActiveTab('clientes')} />
                        <TabButton active={activeTab === 'historial'} icon="bar-chart-3" label="Estadísticas" onClick={() => setActiveTab('historial')} />
                    </nav>
                    
                    <div className="mt-auto">
                        <div className={`p-4 rounded-2xl border transition-colors ${saving ? 'border-amber-500/50 bg-amber-500/5' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${saving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400">
                                    {saving ? 'Guardando en GitHub...' : 'Sincronizado'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 lg:ml-64 p-6 lg:p-12">
                <header className="flex justify-between items-center mb-10 lg:hidden">
                    <button onClick={() => setSidebarOpen(true)} className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <Icon name="menu" />
                    </button>
                    <h2 className="font-black italic uppercase text-blue-500">{activeTab}</h2>
                </header>

                <div className="max-w-6xl mx-auto">
                    {activeTab === 'turnos' && window.TurnosModule && (
                        <window.TurnosModule 
                            appointments={db.turnos} 
                            onAdd={(t) => addItem('turnos', t)}
                            onDelete={(id) => deleteItem('turnos', id)}
                            onComplete={handleCompleteTurno}
                        />
                    )}
                    {activeTab === 'gasto' && window.GastosModule && (
                        <window.GastosModule 
                            expenses={db.gastos} 
                            onAdd={(g) => addItem('gastos', g)}
                            onDelete={(id) => deleteItem('gastos', id)}
                        />
                    )}
                    {activeTab === 'clientes' && window.ClientesModule && (
                        <window.ClientesModule 
                            clients={db.clientes} 
                            setClients={(newList) => {
                                setDb({ ...db, clientes: newList });
                                syncToCloud({ ...db, clientes: newList });
                            }} 
                        />
                    )}
                    {activeTab === 'historial' && window.HistorialModule && (
                        <window.HistorialModule services={db.historial} expenses={db.gastos} />
                    )}
                </div>
            </main>

            {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}
        </div>
    );
};

const TabButton = ({ active, icon, label, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
        <window.LucideIcon name={icon} size={16} />
        {label}
    </button>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
