import { useState } from 'react';
import { Search, AlertTriangle, Check, ShieldAlert, ArrowLeftRight, CheckSquare, Square, RefreshCcw, EyeOff } from 'lucide-react';
import { Product } from '../types';

interface ReconciliationTabProps {
  products: Product[];
  onReconcile: (productId: string, action: 'bling' | 'channel' | 'ignore', canal: 'mercadolivre' | 'shopee') => void;
  onReconcileBulk: (productIds: string[], direction: 'to_bling' | 'to_channel') => void;
  isProcessing: boolean;
}

export default function ReconciliationTab({ products, onReconcile, onReconcileBulk, isProcessing }: ReconciliationTabProps) {
  const [search, setSearch] = useState('');
  const [filterChannel, setFilterChannel] = useState<'all' | 'mercadolivre' | 'shopee'>('all');
  const [filterType, setFilterType] = useState<'all' | 'discrepancy' | 'synced' | 'ignored'>('discrepancy');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter products based on search criteria
  const filteredProducts = products.filter(p => {
    // Search query
    const matchSearch = p.sku.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase());
    
    // Channel filter
    let matchChannel = true;
    if (filterChannel === 'mercadolivre') {
      matchChannel = p.ml_status !== 'not_listed' && p.ml_status !== null;
    } else if (filterChannel === 'shopee') {
      matchChannel = p.shopee_status !== 'not_listed' && p.shopee_status !== null;
    }

    // Divergence type filter
    let matchType = true;
    const hasMlDiscrepancy = p.bling_stock !== p.ml_stock;
    const hasShopeeDiscrepancy = p.shopee_stock !== null && p.bling_stock !== p.shopee_stock;
    const isDiscrepant = hasMlDiscrepancy || hasShopeeDiscrepancy;

    if (filterType === 'discrepancy') {
      matchType = isDiscrepant && !p.ignored_alert;
    } else if (filterType === 'synced') {
      matchType = !isDiscrepant && !p.ignored_alert;
    } else if (filterType === 'ignored') {
      matchType = !!p.ignored_alert;
    }

    return matchSearch && matchChannel && matchType;
  });

  // Handle individual selection toggles
  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle selection of all filtered items
  const toggleSelectAll = () => {
    const filterIds = filteredProducts.map(p => p.id);
    const allSelected = filterIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !filterIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...filterIds])));
    }
  };

  // Handle bulk correction actions
  const handleBulkAction = (direction: 'to_bling' | 'to_channel') => {
    if (selectedIds.length === 0) return;
    onReconcileBulk(selectedIds, direction);
    setSelectedIds([]); // clear selection
  };

  return (
    <div className="space-y-5 animate-fade-in">
      
      {/* Tab intro text */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Painel de Conciliação de Estoque & Preços</h2>
        <p className="text-xs text-zinc-400">Audite e corrija discrepâncias de estoque e preços cadastrados no Bling ERP e ativos nas lojas Mercado Livre e Shopee.</p>
      </div>

      {/* Advanced filters and search block */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Filtrar por SKU ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* Filters dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Channel */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Canal:</span>
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-zinc-700 font-mono"
            >
              <option value="all">Todos os Canais</option>
              <option value="mercadolivre">Mercado Livre</option>
              <option value="shopee">Shopee</option>
            </select>
          </div>

          {/* Status type */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Filtro:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-zinc-700 font-mono"
            >
              <option value="discrepancy">Com Divergência</option>
              <option value="synced">Sincronizados</option>
              <option value="ignored">Silenciados/Ignorados</option>
              <option value="all">Todos os Itens</option>
            </select>
          </div>
        </div>

      </div>

      {/* Bulk action bar (if any selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-xs text-emerald-400 font-medium">
              <span className="font-bold">{selectedIds.length}</span> produtos selecionados para correção em lote.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('to_bling')}
              disabled={isProcessing}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-400" />
              Sincronizar no Bling (Puxar)
            </button>
            <button
              onClick={() => handleBulkAction('to_channel')}
              disabled={isProcessing}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-xs font-bold text-zinc-950 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Atualizar Canais (Empurrar)
            </button>
          </div>
        </div>
      )}

      {/* Table grid listing */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/80 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">
                  <button 
                    onClick={toggleSelectAll}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.includes(p.id)) ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-3">Produto / SKU</th>
                <th className="py-3.5 px-3 text-center">Preço</th>
                <th className="py-3.5 px-3 text-center bg-zinc-900/30">Bling ERP</th>
                <th className="py-3.5 px-3 text-center">Mercado Livre</th>
                <th className="py-3.5 px-3 text-center">Shopee</th>
                <th className="py-3.5 px-3 text-right">Ações de Resolução</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-500 font-mono">
                    Nenhuma divergência encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const hasMlDiscrepancy = p.bling_stock !== p.ml_stock;
                  const hasShopeeDiscrepancy = p.shopee_stock !== null && p.bling_stock !== p.shopee_stock;
                  
                  return (
                    <tr key={p.id} className="hover:bg-zinc-900/20 transition-colors group">
                      {/* Checkbox select */}
                      <td className="py-4 px-4 text-center">
                        <button 
                          onClick={() => toggleSelect(p.id)}
                          className="text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          {selectedIds.includes(p.id) ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Product identity */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded bg-zinc-900 object-cover border border-zinc-800" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-mono font-bold">
                              SEM
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors leading-tight">{p.name}</p>
                            <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">SKU: {p.sku}</span>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-3 text-center font-mono font-medium text-zinc-300">
                        R$ {p.price.toFixed(2)}
                      </td>

                      {/* Bling stock */}
                      <td className="py-4 px-3 text-center font-mono font-semibold text-white bg-zinc-900/10">
                        {p.bling_stock} un.
                      </td>

                      {/* ML Stock */}
                      <td className="py-4 px-3 text-center">
                        {p.ml_status === 'not_listed' ? (
                          <span className="text-zinc-600 text-[10px] font-mono">Não Listado</span>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className={`font-mono font-semibold ${hasMlDiscrepancy ? 'text-amber-400' : 'text-zinc-300'}`}>
                              {p.ml_stock} un.
                            </span>
                            {hasMlDiscrepancy && (
                              <span className="text-[9px] font-mono text-amber-500/80 bg-amber-500/5 px-1 rounded border border-amber-500/10 mt-0.5">
                                Dif: {Math.abs(p.bling_stock - p.ml_stock)}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Shopee Stock */}
                      <td className="py-4 px-3 text-center">
                        {p.shopee_stock === null || p.shopee_status === 'not_listed' ? (
                          <span className="text-zinc-600 text-[10px] font-mono">Não Listado</span>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className={`font-mono font-semibold ${hasShopeeDiscrepancy ? 'text-amber-400' : 'text-zinc-300'}`}>
                              {p.shopee_stock} un.
                            </span>
                            {hasShopeeDiscrepancy && (
                              <span className="text-[9px] font-mono text-amber-500/80 bg-amber-500/5 px-1 rounded border border-amber-500/10 mt-0.5">
                                Dif: {Math.abs(p.bling_stock - p.shopee_stock)}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Resolution Actions */}
                      <td className="py-4 px-3 text-right space-x-1.5 whitespace-nowrap">
                        {(!hasMlDiscrepancy && !hasShopeeDiscrepancy) ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded-full border border-emerald-500/10">
                            <Check className="w-3 h-3" />
                            Sincronizado
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            {/* Resolution selector */}
                            <button
                              title="Puxar estoque ativo do canal para corrigir o Bling ERP"
                              onClick={() => onReconcile(p.id, 'bling', hasMlDiscrepancy ? 'mercadolivre' : 'shopee')}
                              disabled={isProcessing}
                              className="px-2 py-1 bg-zinc-900 hover:bg-zinc-850 text-[10px] font-semibold text-zinc-300 hover:text-white rounded border border-zinc-850 transition-colors"
                            >
                              Corrige no Bling
                            </button>
                            <button
                              title="Forçar estoque do Bling ERP para o marketplace ativo"
                              onClick={() => onReconcile(p.id, 'channel', hasMlDiscrepancy ? 'mercadolivre' : 'shopee')}
                              disabled={isProcessing}
                              className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-[10px] font-semibold text-zinc-950 rounded transition-colors"
                            >
                              Corrige no Canal
                            </button>
                            <button
                              title="Ignorar ou silenciar divergência de estoque"
                              onClick={() => onReconcile(p.id, 'ignore', 'mercadolivre')}
                              disabled={isProcessing}
                              className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-900 transition-colors"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
