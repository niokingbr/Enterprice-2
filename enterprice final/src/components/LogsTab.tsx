import { useState } from 'react';
import { Search, Terminal, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { LogEntry } from '../types';

interface LogsTabProps {
  logs: LogEntry[];
}

export default function LogsTab({ logs }: LogsTabProps) {
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState<'all' | 'Sistema' | 'Bling' | 'Mercado Livre' | 'Shopee'>('all');
  const [filterType, setFilterType] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // Filter logs dynamically
  const filteredLogs = logs.filter(log => {
    const matchSearch = log.message.toLowerCase().includes(search.toLowerCase()) || 
                        (log.details && log.details.toLowerCase().includes(search.toLowerCase()));
    const matchSource = filterSource === 'all' || log.source === filterSource;
    const matchType = filterType === 'all' || log.type === filterType;
    return matchSearch && matchSource && matchType;
  });

  // Handle payload clipboard copy
  const handleCopyPayload = (id: string, payload: string) => {
    navigator.clipboard.writeText(payload);
    setCopiedLogId(id);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      
      {/* Tab Header info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Logs de Integração de API</h2>
          <p className="text-xs text-zinc-400">Rastreio em tempo real e auditoria técnica de requisições HTTP e payloads das APIs.</p>
        </div>
      </div>

      {/* Log filters bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Pesquisar nos detalhes do log..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* Filters dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Source */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Origem:</span>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-zinc-700 font-mono"
            >
              <option value="all">Todas as Fontes</option>
              <option value="Sistema">Sistema</option>
              <option value="Bling">Bling ERP</option>
              <option value="Mercado Livre">Mercado Livre</option>
              <option value="Shopee">Shopee</option>
            </select>
          </div>

          {/* Level */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Severidade:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-zinc-700 font-mono"
            >
              <option value="all">Todos os Níveis</option>
              <option value="info">Info (Azul)</option>
              <option value="success">Success (Verde)</option>
              <option value="warning">Warning (Amarelo)</option>
              <option value="error">Error (Vermelho)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Accordion list */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-900">
        {filteredLogs.length === 0 ? (
          <div className="py-10 text-center text-zinc-500 font-mono text-xs">
            Nenhum evento registrado com os filtros selecionados.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            
            // Icon mapping based on log type
            const logIconMap = {
              success: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />,
              info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
              warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
              error: <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            };

            const bgClasses = {
              success: 'hover:bg-emerald-500/[0.01]',
              info: 'hover:bg-blue-500/[0.01]',
              warning: 'hover:bg-amber-500/[0.01]',
              error: 'hover:bg-red-500/[0.01]'
            };

            return (
              <div key={log.id} className={`transition-colors ${bgClasses[log.type]}`}>
                
                {/* Accordion header trigger button */}
                <button
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="w-full text-left p-4 flex items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    {logIconMap[log.type]}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">
                        {log.source}
                      </span>
                      <p className="text-xs font-semibold text-white leading-snug truncate">
                        {log.message}
                      </p>
                      {log.details && (
                        <p className="text-[11px] text-zinc-400 truncate max-w-sm sm:max-w-xs md:max-w-md lg:max-w-lg hidden sm:block">
                          — {log.details}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto mt-2 sm:mt-0">
                    <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                    {log.payload ? (
                      isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <div className="w-4 h-4"></div>
                    )}
                  </div>
                </button>

                {/* Expanded Payload Inspection */}
                {isExpanded && log.payload && (
                  <div className="bg-zinc-950 px-4 pb-4 animate-fade-in border-t border-zinc-900/60 pt-3">
                    {/* Log Details for mobile */}
                    {log.details && (
                      <p className="text-xs text-zinc-400 mb-2 sm:hidden font-sans font-medium">
                        <b>Detalhes:</b> {log.details}
                      </p>
                    )}

                    <div className="rounded-lg bg-zinc-900/40 border border-zinc-900 p-3.5 space-y-2.5">
                      {/* Sub-header inside inspection box */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                          Inspeção de Payload JSON (Request/Response)
                        </span>
                        
                        {/* Copy button */}
                        <button
                          onClick={() => handleCopyPayload(log.id, log.payload!)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-900 border border-zinc-850 text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedLogId === log.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copiar JSON
                            </>
                          )}
                        </button>
                      </div>

                      {/* Codeblock layout */}
                      <pre className="text-[10px] font-mono text-zinc-300 leading-normal overflow-x-auto bg-zinc-950 p-3 rounded-md border border-zinc-900/80 max-h-[220px]">
                        <code>{log.payload}</code>
                      </pre>
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
