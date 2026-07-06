import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, RefreshCw, ServerOff, Clock } from 'lucide-react';
import { APIStatus } from '../types';

interface MonitorTabProps {
  apiStatus: APIStatus[];
  onSync: () => void;
  isSyncing: boolean;
}

export default function MonitorTab({ apiStatus, onSync, isSyncing }: MonitorTabProps) {
  // Generate mock latency history points for the graph
  const [latencyHistory, setLatencyHistory] = useState<Record<string, number[]>>({
    bling: [110, 130, 115, 140, 120, 125, 124],
    mercadolivre: [160, 195, 180, 210, 175, 190, 185],
    shopee: [270, 310, 285, 330, 295, 305, 290]
  });

  // Periodically add slight variations to the history to make the monitors look real-time and alive
  useEffect(() => {
    const interval = setInterval(() => {
      setLatencyHistory(prev => {
        const next = { ...prev };
        apiStatus.forEach(status => {
          const currentHist = [...next[status.id]];
          // Keep only the last 10 points
          if (currentHist.length >= 10) currentHist.shift();
          currentHist.push(status.latency === 999 ? 0 : status.latency);
          next[status.id] = currentHist;
        });
        return next;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [apiStatus]);

  // Render responsive SVG line path
  const renderSvgLine = (dataPoints: number[], colorClass: string) => {
    if (dataPoints.length === 0) return null;
    const maxVal = 400; // max latency scale
    const width = 300;
    const height = 60;
    
    const points = dataPoints.map((val, idx) => {
      const x = (idx / (dataPoints.length - 1)) * width;
      const y = height - ((val / maxVal) * height);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-16" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Gradient fill */}
        <defs>
          <linearGradient id={`grad-${colorClass}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorClass === 'emerald' ? '#10b981' : colorClass === 'amber' ? '#f59e0b' : '#f97316'} stopOpacity="0.2"/>
            <stop offset="100%" stopColor={colorClass === 'emerald' ? '#10b981' : colorClass === 'amber' ? '#f59e0b' : '#f97316'} stopOpacity="0.0"/>
          </linearGradient>
        </defs>

        {/* Shaded Area */}
        <path
          d={`M 0,${height} L ${points} L ${width},${height} Z`}
          fill={`url(#grad-${colorClass})`}
        />

        {/* Line */}
        <polyline
          fill="none"
          stroke={colorClass === 'emerald' ? '#10b981' : colorClass === 'amber' ? '#f59e0b' : '#f97316'}
          strokeWidth="1.5"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Central de Monitoria de Conexões</h2>
          <p className="text-xs text-zinc-400">Status em tempo real das conexões via API com os canais de integração.</p>
        </div>
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          Testar Latência
        </button>
      </div>

      {/* Grid status APIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {apiStatus.map((api) => {
          const isError = api.status === 'error';
          const isWarning = api.status === 'warning';
          
          let colorTheme = 'emerald';
          let borderTheme = 'border-emerald-950/30';
          let bgTheme = 'bg-emerald-950/5';
          let textTheme = 'text-emerald-400';

          if (isError) {
            colorTheme = 'orange'; // shopee / error
            borderTheme = 'border-red-950/40';
            bgTheme = 'bg-red-950/5';
            textTheme = 'text-red-400';
          } else if (isWarning || api.id === 'mercadolivre') {
            colorTheme = 'amber';
            borderTheme = 'border-yellow-950/30';
            bgTheme = 'bg-yellow-950/5';
            textTheme = 'text-yellow-400';
          }

          return (
            <div key={api.id} className={`bg-zinc-950 border ${borderTheme} rounded-xl p-5 flex flex-col justify-between h-[280px]`}>
              {/* Header card info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">{api.name}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">ID: API_{api.id.toUpperCase()}</p>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-mono border flex items-center gap-1 font-medium ${
                    isError 
                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    {isError ? (
                      <>
                        <ServerOff className="w-2.5 h-2.5" />
                        Ondulando / Error
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Ativa / Saudável
                      </>
                    )}
                  </div>
                </div>

                {/* Core metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block">Latência</span>
                    <span className={`text-xl font-bold font-mono tracking-tight ${isError ? 'text-zinc-500' : 'text-white'}`}>
                      {isError ? 'Timeout' : `${api.latency}ms`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block">Uptime Mensal</span>
                    <span className="text-xl font-bold font-mono text-white tracking-tight">
                      {api.uptime}%
                    </span>
                  </div>
                </div>
              </div>

              {/* SVG Sparkline Graph */}
              <div className="my-2 border-y border-zinc-900/60 py-2">
                <div className="flex justify-between text-[8px] font-mono text-zinc-600 mb-1">
                  <span>HISTÓRICO RECENTE</span>
                  <span>MAX: 400ms</span>
                </div>
                {renderSvgLine(latencyHistory[api.id] || [], colorTheme)}
              </div>

              {/* Usage bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-zinc-400">Consumo da API (Hoje)</span>
                  <span className="text-zinc-300">{api.requests_today} / {api.requests_limit} reqs</span>
                </div>
                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isError ? 'bg-zinc-600' : 'bg-emerald-500'}`}
                    style={{ width: `${(api.requests_today / api.requests_limit) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational guidelines box */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          Intervalos de Sincronia e Segurança
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Para garantir a saúde operacional e não ultrapassar o limite (rate limit) das APIs oficiais do Bling, Mercado Livre e Shopee, o CID Enterprise opera com um cache de sincronização de estoque e preço. Divergências críticas de produtos com estoque zerado no ERP Bling são identificadas de forma prioritária e forçadas para os canais imediatamente após as vendas, prevenindo rupturas ou vendas sem estoque real.
        </p>
      </div>
    </div>
  );
}
