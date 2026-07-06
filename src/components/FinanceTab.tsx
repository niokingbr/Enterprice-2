import { useState, FormEvent } from 'react';
import { DollarSign, Percent, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Plus, Circle as HelpCircle, Eye, EyeOff } from 'lucide-react';
import { FinancialTransaction } from '../types';

interface FinanceTabProps {
  finances: FinancialTransaction[];
  onAddTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;
  isProcessing: boolean;
}

export default function FinanceTab({ finances, onAddTransaction, isProcessing }: FinanceTabProps) {
  // Multiselect filter states
  const [channels, setChannels] = useState<{ mercadolivre: boolean; shopee: boolean; bling: boolean; all: boolean }>({
    mercadolivre: true,
    shopee: true,
    bling: true,
    all: true
  });

  // Manual Transaction Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [formCategory, setFormCategory] = useState('Marketing e Tráfego');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formMarketplace, setFormMarketplace] = useState<'mercadolivre' | 'shopee' | 'bling' | 'all'>('mercadolivre');

  // Toggle channel filter
  const toggleChannel = (key: keyof typeof channels) => {
    setChannels(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Set preset filters (shortcuts)
  const setFilterPreset = (preset: 'all' | 'ml_only' | 'shopee_only' | 'bling_only') => {
    if (preset === 'all') {
      setChannels({ mercadolivre: true, shopee: true, bling: true, all: true });
    } else if (preset === 'ml_only') {
      setChannels({ mercadolivre: true, shopee: false, bling: false, all: false });
    } else if (preset === 'shopee_only') {
      setChannels({ mercadolivre: false, shopee: true, bling: false, all: false });
    } else if (preset === 'bling_only') {
      setChannels({ mercadolivre: false, shopee: false, bling: true, all: false });
    }
  };

  // Filter transactions dynamically based on active channels
  const filteredTransactions = finances.filter(tx => {
    if (tx.marketplace === 'mercadolivre' && !channels.mercadolivre) return false;
    if (tx.marketplace === 'shopee' && !channels.shopee) return false;
    if (tx.marketplace === 'bling' && !channels.bling) return false;
    if (tx.marketplace === 'all' && !channels.all) return false;
    return true;
  });

  // Calculate Financial metrics based on active filters
  let grossRevenue = 0;
  let totalExpenses = 0;

  filteredTransactions.forEach(tx => {
    if (tx.type === 'income') {
      grossRevenue += tx.amount;
    } else {
      totalExpenses += tx.amount;
    }
  });

  const netResult = grossRevenue - totalExpenses;
  const netMargin = grossRevenue > 0 ? (netResult / grossRevenue) * 100 : 0;

  // Calculate Expense Distribution by Category
  const categoriesMap: Record<string, number> = {
    'Impostos': 0,
    'Logística e Frete': 0,
    'Marketing e Tráfego': 0,
    'Taxas do Marketplace': 0,
    'Custo de Produto (COGS)': 0,
    'Assinaturas e Ferramentas': 0
  };

  filteredTransactions.forEach(tx => {
    if (tx.type === 'expense') {
      const category = tx.category;
      if (categoriesMap[category] !== undefined) {
        categoriesMap[category] += tx.amount;
      } else {
        categoriesMap['Assinaturas e Ferramentas'] += tx.amount;
      }
    }
  });

  const maxExpenseValue = Math.max(...Object.values(categoriesMap), 1);

  // Form submission handler
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0 || !formDescription.trim()) return;

    onAddTransaction({
      date: new Date().toISOString().split('T')[0],
      type: formType,
      category: formCategory,
      description: formDescription,
      amount,
      marketplace: formMarketplace
    });

    // Reset Form
    setFormDescription('');
    setFormAmount('');
    setShowAddForm(false);
  };

  // Render SVG area/line graph for financial timeline
  // Timestamps sorted chronologically
  const timelineData = [
    { label: '01/Jul', revenue: 15420, expense: 0 },
    { label: '02/Jul', revenue: 25270, expense: 8900 },
    { label: '03/Jul', revenue: 25270, expense: 13140 },
    { label: '04/Jul', revenue: 25270, expense: 15856 },
    { label: '05/Jul', revenue: 25270, expense: 17231 },
    { label: '06/Jul', revenue: 25270, expense: 17351 },
  ];

  // Adjust coordinates in SVG according to actual filtered values (scaling factors)
  const renderFinancialTimeline = () => {
    const width = 500;
    const height = 120;
    const padding = 15;
    
    // Scale points
    const maxVal = Math.max(grossRevenue, totalExpenses, 30000);
    
    const revenuePoints = timelineData.map((d, idx) => {
      // If we filtered out Mercado Livre, we scale down the display
      const currentRevenue = channels.mercadolivre && channels.shopee ? d.revenue 
                           : channels.mercadolivre ? d.revenue * 0.6 
                           : channels.shopee ? d.revenue * 0.4 : 0;

      const x = padding + (idx / (timelineData.length - 1)) * (width - padding * 2);
      const y = height - padding - (currentRevenue / maxVal) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    const expensePoints = timelineData.map((d, idx) => {
      // Scale expense points according to selected filters
      let currentExpense = d.expense;
      if (!channels.mercadolivre) currentExpense -= 3317.20; // ML specific expenses removed
      if (!channels.shopee) currentExpense -= 2223.00; // Shopee specific expenses removed
      if (!channels.bling) currentExpense -= 8975.00; // Bling specific COGS & tools removed
      if (!channels.all) currentExpense -= 2836.20; // consolidated/shared fees removed
      currentExpense = Math.max(0, currentExpense);

      const x = padding + (idx / (timelineData.length - 1)) * (width - padding * 2);
      const y = height - padding - (currentExpense / maxVal) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-32" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Shaded areas */}
        <polyline fill="none" stroke="#10b981" strokeWidth="2" points={revenuePoints} />
        <polyline fill="none" stroke="#f43f5e" strokeWidth="2" points={expensePoints} />
        
        {/* Render points */}
        {timelineData.map((d, idx) => {
          const x = padding + (idx / (timelineData.length - 1)) * (width - padding * 2);
          return (
            <g key={idx}>
              <line x1={x} y1={padding} x2={x} y2={height - padding} stroke="#27272a" strokeWidth="1" strokeDasharray="2,2" />
              <text x={x} y={height - 2} fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">{d.label}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header and Filter Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Painel de Auditoria & Fluxo Financeiro</h2>
          <p className="text-xs text-zinc-400">Controle dinâmico e consolidação de despesas de marketing, logística e COGS.</p>
        </div>

        {/* Preset filter Shortcuts */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-zinc-900/60 p-1 rounded-lg border border-zinc-800">
          <button 
            onClick={() => setFilterPreset('all')}
            className="px-2.5 py-1 text-[10px] font-semibold text-zinc-300 hover:text-white rounded bg-zinc-950/40 hover:bg-zinc-950 transition-colors"
          >
            Consolidado
          </button>
          <button 
            onClick={() => setFilterPreset('ml_only')}
            className="px-2.5 py-1 text-[10px] font-semibold text-zinc-300 hover:text-white rounded bg-zinc-950/40 hover:bg-zinc-950 transition-colors"
          >
            Só ML
          </button>
          <button 
            onClick={() => setFilterPreset('shopee_only')}
            className="px-2.5 py-1 text-[10px] font-semibold text-zinc-300 hover:text-white rounded bg-zinc-950/40 hover:bg-zinc-950 transition-colors"
          >
            Só Shopee
          </button>
          <button 
            onClick={() => setFilterPreset('bling_only')}
            className="px-2.5 py-1 text-[10px] font-semibold text-zinc-300 hover:text-white rounded bg-zinc-950/40 hover:bg-zinc-950 transition-colors"
          >
            Só Bling
          </button>
        </div>
      </div>

      {/* Multi-select Channel Filter Row */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
        <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-3">Filtro Ativo Multiselecção de Canais</span>
        <div className="flex flex-wrap items-center gap-4">
          {/* Mercado Livre */}
          <button
            onClick={() => toggleChannel('mercadolivre')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${
              channels.mercadolivre
                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                : 'bg-zinc-900 border-zinc-800 text-zinc-600'
            }`}
          >
            {channels.mercadolivre ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Mercado Livre
          </button>

          {/* Shopee */}
          <button
            onClick={() => toggleChannel('shopee')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${
              channels.shopee
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-500'
                : 'bg-zinc-900 border-zinc-800 text-zinc-600'
            }`}
          >
            {channels.shopee ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Shopee
          </button>

          {/* Bling ERP */}
          <button
            onClick={() => toggleChannel('bling')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${
              channels.bling
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-600'
            }`}
          >
            {channels.bling ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Bling ERP
          </button>

          {/* Consolidado */}
          <button
            onClick={() => toggleChannel('all')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${
              channels.all
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-600'
            }`}
          >
            {channels.all ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Despesas Compartilhadas / Impostos
          </button>
        </div>
      </div>

      {/* Dynamic Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Gross Revenue */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-zinc-400 font-medium">Faturamento Bruto</span>
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-extrabold font-mono text-white tracking-tight">R$ {grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <span className="text-[10px] text-zinc-500 font-mono block mt-1">Soma de receitas filtradas</span>
        </div>

        {/* Expenses */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-zinc-400 font-medium">Despesas Totais</span>
            <span className="p-1 rounded-md bg-red-500/10 text-red-400">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-extrabold font-mono text-white tracking-tight">R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <span className="text-[10px] text-zinc-500 font-mono block mt-1">Taxas, envios, impostos, COGS</span>
        </div>

        {/* Net result */}
        <div className={`bg-zinc-950 border rounded-xl p-5 ${netResult >= 0 ? 'border-emerald-950/30' : 'border-red-950/40'}`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-zinc-400 font-medium">Resultado Líquido</span>
            <span className={`p-1 rounded-md ${netResult >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {netResult >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            </span>
          </div>
          <p className={`text-2xl font-extrabold font-mono tracking-tight ${netResult >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            R$ {netResult.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-zinc-500 font-mono block mt-1">Lucro operacional real livre</span>
        </div>

        {/* Margin */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-zinc-400 font-medium">Margem Operacional</span>
            <span className="p-1 rounded-md bg-blue-500/10 text-blue-400">
              <Percent className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-extrabold font-mono text-white tracking-tight">{netMargin.toFixed(1)}%</p>
          <span className="text-[10px] text-zinc-500 font-mono block mt-1">Eficiência agregada filtrada</span>
        </div>

      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Financial Timeline Graph */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Evolução do Saldo Consolidado</h3>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Faturamento</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Despesas</span>
            </div>
          </div>
          {renderFinancialTimeline()}
        </div>

        {/* Expenses Distribution */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-4">Distribuição de Despesas por Categoria</h3>
          <div className="space-y-3.5">
            {Object.entries(categoriesMap).map(([category, val]) => {
              const pct = val > 0 ? (val / maxExpenseValue) * 100 : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-zinc-400 font-medium">{category}</span>
                    <span className="text-zinc-300 font-semibold">R$ {val.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-700 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Ledger Table & Quick Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ledger Table (2/3 width on large) */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Histórico de Transações Recentes</h3>
            <span className="text-[10px] text-zinc-500 font-mono">{filteredTransactions.length} lançamentos exibidos</span>
          </div>

          <div className="overflow-y-auto max-h-[220px] divide-y divide-zinc-900 space-y-2 pr-1">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center py-2.5 text-xs">
                <div className="flex items-center gap-3">
                  <span className={`p-1.5 rounded-lg border ${
                    tx.type === 'income' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {tx.type === 'income' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  </span>
                  <div>
                    <p className="font-semibold text-white leading-tight">{tx.description}</p>
                    <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">{tx.date} • {tx.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                    {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">{tx.marketplace}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Ledger Form (1/3 width) */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Lançamento Manual
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type selection */}
            <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setFormType('expense')}
                className={`py-1.5 text-xs font-medium rounded transition-all ${
                  formType === 'expense'
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setFormType('income')}
                className={`py-1.5 text-xs font-medium rounded transition-all ${
                  formType === 'income'
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Receita
              </button>
            </div>

            {/* Category selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Categoria</label>
              {formType === 'expense' ? (
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700"
                >
                  <option value="Custo de Produto (COGS)">Custo de Produto (COGS)</option>
                  <option value="Taxas do Marketplace">Taxas do Marketplace</option>
                  <option value="Impostos">Impostos</option>
                  <option value="Logística e Frete">Logística e Frete</option>
                  <option value="Marketing e Tráfego">Marketing e Tráfego</option>
                  <option value="Assinaturas e Ferramentas">Assinaturas e Ferramentas</option>
                </select>
              ) : (
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700"
                >
                  <option value="Vendas (Receitas)">Vendas (Receitas)</option>
                  <option value="Reembolsos e Estornos">Reembolsos e Estornos</option>
                  <option value="Ajustes de Caixa">Ajustes de Caixa</option>
                </select>
              )}
            </div>

            {/* Marketplace selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Canal Origem</label>
              <select
                value={formMarketplace}
                onChange={(e) => setFormMarketplace(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700"
              >
                <option value="mercadolivre">Mercado Livre</option>
                <option value="shopee">Shopee</option>
                <option value="bling">Bling ERP</option>
                <option value="all">Todas as Contas (Consolidado)</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Descrição</label>
              <input
                type="text"
                required
                placeholder="Ex: Reposição de caixas de envio"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
              />
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Valor (R$)</label>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                placeholder="Ex: 149.90"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-white font-semibold rounded-lg text-xs border border-zinc-800 transition-colors cursor-pointer active:scale-95"
            >
              Registrar Lançamento
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
