import { RefreshCw, Play, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  isSyncing: boolean;
  onSync: () => void;
  lastSyncTime: string;
}

export default function Header({ isSyncing, onSync, lastSyncTime }: HeaderProps) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/60 backdrop-blur-xl px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            CI
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              CID Enterprise
              <span className="text-xs font-normal text-zinc-500 font-mono">v1.2.0</span>
            </h1>
            <p className="text-xs text-zinc-400">
              Centro de Inteligência Operacional • Bling ERP, Mercado Livre & Shopee
            </p>
          </div>
        </div>

        {/* Operating Status & Sync Action */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Status Indicators */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono">
            <span className="text-zinc-400">Canal Ativo:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-white">Bling ERP Hub</span>
            </div>
          </div>

          {/* Mode Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
            <Play className="w-3.5 h-3.5 animate-pulse" />
            PRODUÇÃO API
          </div>

          {/* Sync Trigger button */}
          <button
            id="btn-sync-all"
            onClick={onSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              isSyncing
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 active:scale-95 shadow-[0_1px_15px_rgba(16,185,129,0.2)]'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Tudo'}
          </button>
        </div>
      </div>
      
      {/* Last Sync Info Bar */}
      <div className="max-w-7xl mx-auto flex items-center justify-end mt-1">
        <span className="text-[10px] text-zinc-500 font-mono">
          Última atualização: {lastSyncTime || 'Carregando...'}
        </span>
      </div>
    </header>
  );
}
