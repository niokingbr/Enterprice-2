import { TriangleAlert as AlertTriangle, TrendingUp, ShoppingBag, CircleCheck as CheckCircle2, ShieldAlert, ArrowRight, Ban, Zap } from 'lucide-react';
import { Product, Order, LogEntry } from '../types';

interface DashboardTabProps {
  products: Product[];
  orders: Order[];
  logs: LogEntry[];
  setActiveTab: (tab: string) => void;
}

export default function DashboardTab({ products, orders, logs, setActiveTab }: DashboardTabProps) {
  // Calculate severity KPIs
  let criticalCount = 0; // Stock out or critical pricing gap
  let highCount = 0;     // Paused items or heavy mismatches
  let mediumCount = 0;   // Minor discrepancies
  let infoCount = 0;     // Quality alerts (description, title etc)

  products.forEach(p => {
    if (p.ignored_alert) return;

    // Critical: Bling stock is 0 but Active in Channel OR massive stock imbalance
    if ((p.bling_stock === 0 && (p.ml_stock > 0 || (p.shopee_stock && p.shopee_stock > 0)))) {
      criticalCount++;
    } else if (p.bling_stock !== p.ml_stock && p.shopee_stock !== null && p.bling_stock !== p.shopee_stock) {
      highCount++;
    } else if (p.bling_stock !== p.ml_stock || (p.shopee_stock !== null && p.bling_stock !== p.shopee_stock)) {
      mediumCount++;
    }

    // Quality Alerts (Informativos)
    if (!p.has_photo || !p.has_description || !p.title_valid || !p.attributes_complete) {
      infoCount++;
    }
  });

  // Productivity Metrics
  const ordersToday = orders.filter(o => o.date.startsWith('2026-07-06')).length;
  const blockedOrders = orders.filter(o => o.status === 'stopped' || o.status === 'invoice_pending').length;
  const automaticCorrections = logs.filter(l => l.message.includes('corrigido') || l.message.includes('Correção')).length;

  // Active channel counts
  const totalBlingProducts = products.length;
  const mlActiveAnnouncements = products.filter(p => p.ml_status === 'active').length;
  const shopeeActiveAnnouncements = products.filter(p => p.shopee_status === 'active').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Visual Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Centro de Inteligência Operacional (CIO)</h2>
          <p className="text-sm text-zinc-400 max-w-xl">
            Sua operação está consolidada. Monitorando divergências de estoque, preços incorretos e auditando a saúde financeira das suas lojas Mercado Livre, Shopee e Bling ERP de forma centralizada.
          </p>
        </div>
        <button
          id="btn-goto-reconcile"
          onClick={() => setActiveTab('reconciler')}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium border border-zinc-800 transition-colors whitespace-nowrap active:scale-95"
        >
          Conciliar Divergências
          <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
        </button>
      </div>

      {/* KPI Severity Cards Grid */}
      <div>
        <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">Divergências por Nível de Severidade</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* CRITICAL */}
          <div 
            onClick={() => setActiveTab('reconciler')}
            className="bg-zinc-950 border border-red-950/40 hover:border-red-900/60 rounded-xl p-4 transition-all duration-300 cursor-pointer group hover:bg-red-950/5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-red-400 font-mono">Divergências Críticas</span>
              <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Ban className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-red-500 font-mono tracking-tight">{criticalCount}</span>
              <span className="text-[10px] text-zinc-500 font-mono">SKUs em risco</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 line-clamp-1 group-hover:text-zinc-300 transition-colors">
              Estoque zerado no ERP e ativo nos canais.
            </p>
          </div>

          {/* HIGH */}
          <div 
            onClick={() => setActiveTab('reconciler')}
            className="bg-zinc-950 border border-amber-950/40 hover:border-amber-900/60 rounded-xl p-4 transition-all duration-300 cursor-pointer group hover:bg-amber-950/5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-amber-400 font-mono">Divergências Altas</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-500 font-mono tracking-tight">{highCount}</span>
              <span className="text-[10px] text-zinc-500 font-mono">SKUs desalinhados</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 line-clamp-1 group-hover:text-zinc-300 transition-colors">
              Desbalanço acentuado entre canais e ERP.
            </p>
          </div>

          {/* MEDIUM */}
          <div 
            onClick={() => setActiveTab('reconciler')}
            className="bg-zinc-950 border border-yellow-950/40 hover:border-yellow-900/60 rounded-xl p-4 transition-all duration-300 cursor-pointer group hover:bg-yellow-950/5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-yellow-400 font-mono">Divergências Médias</span>
              <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-yellow-500 font-mono tracking-tight">{mediumCount}</span>
              <span className="text-[10px] text-zinc-500 font-mono">Alertas pontuais</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 line-clamp-1 group-hover:text-zinc-300 transition-colors">
              Pequenos desajustes de saldo de canais.
            </p>
          </div>

          {/* INFO */}
          <div 
            onClick={() => setActiveTab('quality')}
            className="bg-zinc-950 border border-blue-950/40 hover:border-blue-900/60 rounded-xl p-4 transition-all duration-300 cursor-pointer group hover:bg-blue-950/5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-400 font-mono">Qualidade do Anúncio</span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-500 font-mono tracking-tight">{infoCount}</span>
              <span className="text-[10px] text-zinc-500 font-mono">Melhorias pendentes</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 line-clamp-1 group-hover:text-zinc-300 transition-colors">
              Falta de fotos, descrições ou atributos.
            </p>
          </div>

        </div>
      </div>

      {/* Productivity Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold font-mono text-white">{ordersToday}</h4>
            <p className="text-xs text-zinc-400 font-medium">Pedidos Sincronizados Hoje</p>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">Último recebido há poucos minutos</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold font-mono text-white">{blockedOrders}</h4>
            <p className="text-xs text-zinc-400 font-medium">Pedidos Retidos / Bloqueados</p>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">Pendências fiscais ou cadastrais no ERP</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold font-mono text-white">{automaticCorrections}</h4>
            <p className="text-xs text-zinc-400 font-medium">Correções Efetuadas</p>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">Sincronia manual ou automática</p>
          </div>
        </div>

      </div>

      {/* Secondary content: Active Inventory Split & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Inventory Active Channels */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">Mapeamento de Saúde de Catálogo</h4>
          <div className="space-y-4">
            
            {/* Bling ERP */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300 font-medium">Bling ERP (Banco Geral)</span>
                <span className="text-white font-semibold">{totalBlingProducts} SKUs</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            {/* Mercado Livre */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300 font-medium">Mercado Livre (Anúncios Ativos)</span>
                <span className="text-white font-semibold">{mlActiveAnnouncements} / {totalBlingProducts} un.</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${totalBlingProducts > 0 ? (mlActiveAnnouncements / totalBlingProducts) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Shopee */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300 font-medium">Shopee (Anúncios Ativos)</span>
                <span className="text-white font-semibold">{shopeeActiveAnnouncements} / {totalBlingProducts} un.</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${totalBlingProducts > 0 ? (shopeeActiveAnnouncements / totalBlingProducts) * 100 : 0}%` }}></div>
              </div>
            </div>

          </div>
        </div>

        {/* Recent Integration logs (Quick View) */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">Atividades Recentes do Sistema</h4>
            <div className="space-y-3">
              {logs.slice(0, 3).map((log) => {
                const colors = {
                  success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                  info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                  warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                  error: 'text-red-400 bg-red-500/10 border-red-500/20'
                };
                return (
                  <div key={log.id} className="flex gap-3 text-xs">
                    <span className={`px-2 py-0.5 h-fit rounded font-mono border whitespace-nowrap text-[10px] ${colors[log.type]}`}>
                      {log.source}
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-zinc-300 font-medium line-clamp-1">{log.message}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{log.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <button
            onClick={() => setActiveTab('logs')}
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-medium border border-zinc-800 transition-colors mt-4 text-center block"
          >
            Ver Logs Completos
          </button>
        </div>

      </div>
    </div>
  );
}
