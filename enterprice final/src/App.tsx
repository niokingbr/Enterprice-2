import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Activity, 
  DollarSign, 
  CheckSquare, 
  Terminal, 
  Settings, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';

import Header from './components/Header';
import DashboardTab from './components/DashboardTab';
import MonitorTab from './components/MonitorTab';
import ReconciliationTab from './components/ReconciliationTab';
import FinanceTab from './components/FinanceTab';
import QualityTab from './components/QualityTab';
import LogsTab from './components/LogsTab';
import SettingsTab from './components/SettingsTab';

import { Product, Order, APIStatus, LogEntry, FinancialTransaction, SystemConfig } from './types';

export default function App() {
  // Global backend state containers
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [apiStatus, setApiStatus] = useState<APIStatus[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [finances, setFinances] = useState<FinancialTransaction[]>([]);
  const [config, setConfig] = useState<SystemConfig | null>(null);

  // App UI states
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Fetch full dataset from Express on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('Falha ao se comunicar com o backend do CID.');
      
      const data = await res.json();
      setProducts(data.products || []);
      setOrders(data.orders || []);
      setApiStatus(data.apiStatus || []);
      setLogs(data.logs || []);
      setFinances(data.finances || []);
      setConfig(data.config || null);
      
      setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || 'Erro ao carregar os dados. Verifique a conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Global Sincronizar Tudo action
  const handleGlobalSync = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/sync', { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao disparar sincronização global.');
      
      const data = await res.json();
      setProducts(data.products || []);
      if (data.apiStatus) setApiStatus(data.apiStatus);
      if (data.logs) setLogs(data.logs);
      
      setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
    } catch (e: any) {
      console.error(e);
      alert(`Erro na sincronização: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // 2. Individual Reconciliation action
  const handleReconcile = async (productId: string, action: 'bling' | 'channel' | 'ignore', canal: 'mercadolivre' | 'shopee') => {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action, canal })
      });
      if (!res.ok) throw new Error('Falha ao aplicar correção de reconciliação.');
      
      const data = await res.json();
      if (data.products) setProducts(data.products);
      if (data.logs) setLogs(data.logs);
    } catch (e: any) {
      console.error(e);
      alert(`Falha ao conciliar: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Bulk Reconciliation action
  const handleReconcileBulk = async (productIds: string[], direction: 'to_bling' | 'to_channel') => {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/reconcile-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds, direction })
      });
      if (!res.ok) throw new Error('Falha ao aplicar correção em lote.');
      
      const data = await res.json();
      if (data.products) setProducts(data.products);
      if (data.logs) setLogs(data.logs);
    } catch (e: any) {
      console.error(e);
      alert(`Falha ao conciliar em lote: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Register manual financial transaction
  const handleAddTransaction = async (tx: Omit<FinancialTransaction, 'id'>) => {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx)
      });
      if (!res.ok) throw new Error('Falha ao gravar lançamento financeiro.');
      
      const data = await res.json();
      if (data.finances) setFinances(data.finances);
      if (data.logs) setLogs(data.logs);
    } catch (e: any) {
      console.error(e);
      alert(`Falha ao registrar finanças: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Update Connection keys / Mode configuration
  const handleSaveConfig = async (newConfig: SystemConfig) => {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (!res.ok) throw new Error('Falha ao salvar as chaves de integração.');
      
      const data = await res.json();
      if (data.config) setConfig(data.config);
      if (data.logs) setLogs(data.logs);
    } catch (e: any) {
      console.error(e);
      alert(`Falha ao salvar chaves: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Render initial Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-center px-4 select-none">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white font-mono">CID Enterprise</p>
          <p className="text-xs text-zinc-500">Conectando ao Centro de Inteligência Operacional...</p>
        </div>
      </div>
    );
  }

  // Render Error Recovery screen if server call fails
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <div className="space-y-2 max-w-sm">
          <h2 className="text-md font-bold text-white">Falha de Comunicação</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">{errorMessage}</p>
        </div>
        <button
          onClick={fetchInitialData}
          className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-xs font-semibold text-white rounded-lg hover:bg-zinc-850 cursor-pointer transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // Tab definitions
  const navigationItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'reconciler', label: 'Conciliação', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'monitor', label: 'Central de APIs', icon: <Activity className="w-4 h-4" /> },
    { id: 'finances', label: 'Financeiro', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'quality', label: 'Qualidade Anúncios', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'logs', label: 'Logs Integração', icon: <Terminal className="w-4 h-4" /> },
    { id: 'settings', label: 'Chaves de API', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col">
      {/* Dynamic Header */}
      <Header 
        isSyncing={isSyncing} 
        onSync={handleGlobalSync} 
        lastSyncTime={lastSyncTime}
      />

      {/* Main Core Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row gap-6 p-6">
        
        {/* Dynamic Sidebar Navigation */}
        <aside className="md:w-60 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 scrollbar-none">
            {navigationItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium font-mono whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900 text-white border border-zinc-800'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <span className={`${isActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Dynamic Active Panel Content */}
        <main className="flex-1 min-w-0 bg-zinc-950/40">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              products={products} 
              orders={orders} 
              logs={logs} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'reconciler' && (
            <ReconciliationTab 
              products={products} 
              onReconcile={handleReconcile} 
              onReconcileBulk={handleReconcileBulk} 
              isProcessing={isProcessing} 
            />
          )}

          {activeTab === 'monitor' && (
            <MonitorTab 
              apiStatus={apiStatus} 
              onSync={handleGlobalSync} 
              isSyncing={isSyncing} 
            />
          )}

          {activeTab === 'finances' && (
            <FinanceTab 
              finances={finances} 
              onAddTransaction={handleAddTransaction} 
              isProcessing={isProcessing} 
            />
          )}

          {activeTab === 'quality' && (
            <QualityTab 
              products={products} 
            />
          )}

          {activeTab === 'logs' && (
            <LogsTab 
              logs={logs} 
            />
          )}

          {activeTab === 'settings' && config && (
            <SettingsTab 
              config={config} 
              onSaveConfig={handleSaveConfig} 
              isProcessing={isProcessing} 
            />
          )}
        </main>

      </div>
    </div>
  );
}
