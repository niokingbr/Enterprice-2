import { useState } from 'react';
import { Search, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, HelpCircle, ArrowRight, Star } from 'lucide-react';
import { Product } from '../types';

interface QualityTabProps {
  products: Product[];
}

export default function QualityTab({ products }: QualityTabProps) {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);

  const filteredProducts = products.filter(p =>
    p.sku.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Function to calculate individual listing score out of 100
  const calculateScore = (p: Product) => {
    let score = 20; // base score
    if (p.has_photo) score += 20;
    if (p.has_description) score += 20;
    if (p.has_video) score += 20;
    if (p.title_valid) score += 10;
    if (p.attributes_complete) score += 10;
    return score;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* Product List Selector Column (1/3 width) */}
      <div className="space-y-4 lg:col-span-1">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-white tracking-tight">Qualidade dos Anúncios</h2>
          <p className="text-[11px] text-zinc-500">Audite a conformidade de SEO de seus anúncios ativos.</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Pesquisar anúncio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* Scrollable list */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-h-[360px] overflow-y-auto divide-y divide-zinc-900">
          {filteredProducts.map((p) => {
            const isSelected = selectedProduct?.id === p.id;
            const score = calculateScore(p);
            
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className={`w-full text-left p-3 flex items-center justify-between transition-colors ${
                  isSelected ? 'bg-zinc-900/60' : 'hover:bg-zinc-900/20'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded bg-zinc-900 object-cover border border-zinc-800" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[8px] text-zinc-500 font-mono">
                      SEM
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate leading-tight ${isSelected ? 'text-emerald-400' : 'text-zinc-300'}`}>{p.name}</p>
                    <span className="text-[9px] font-mono text-zinc-500 mt-0.5">SKU: {p.sku}</span>
                  </div>
                </div>
                
                {/* Score badge */}
                <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold border ${
                  score >= 80 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : score >= 50 
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {score}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SEO & Conversion checklist detail (2/3 width) */}
      <div className="lg:col-span-2">
        {selectedProduct ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-6">
            
            {/* Header / Meta */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-4">
                {selectedProduct.image_url && (
                  <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-12 h-12 rounded bg-zinc-900 object-cover border border-zinc-800" referrerPolicy="no-referrer" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedProduct.name}</h3>
                  <p className="text-[10px] font-mono text-zinc-500">SKU: {selectedProduct.sku} • Preço: R$ {selectedProduct.price.toFixed(2)}</p>
                </div>
              </div>

              {/* Overall rating */}
              <div className="text-center font-mono">
                <span className="text-[9px] text-zinc-500 uppercase block">Análise de SEO</span>
                <span className="text-2xl font-extrabold text-white">{calculateScore(selectedProduct)}%</span>
              </div>
            </div>

            {/* Checklist Matrix */}
            <div>
              <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-3">Checklist de Auditoria Técnica</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Rule 1: Photo */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-900">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-zinc-300 block">Fotos do Produto</span>
                    <span className="text-[9px] text-zinc-500 block">O anúncio possui foto de alta qualidade</span>
                  </div>
                  {selectedProduct.has_photo ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                </div>

                {/* Rule 2: Description */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-900">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-zinc-300 block">Ficha & Descrição Técnica</span>
                    <span className="text-[9px] text-zinc-500 block">Possui descrição para o cliente</span>
                  </div>
                  {selectedProduct.has_description ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                </div>

                {/* Rule 3: Video */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-900">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-zinc-300 block">Mídia Dinâmica (Vídeo)</span>
                    <span className="text-[9px] text-zinc-500 block">Aumenta a conversão de vendas</span>
                  </div>
                  {selectedProduct.has_video ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                </div>

                {/* Rule 4: Title valid */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-900">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-zinc-300 block">Título do Anúncio</span>
                    <span className="text-[9px] text-zinc-500 block">Tamanho e termos ideais de SEO</span>
                  </div>
                  {selectedProduct.title_valid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                </div>

                {/* Rule 5: Attributes */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-900 sm:col-span-2">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-zinc-300 block">Atributos e Ficha Técnica Completa</span>
                    <span className="text-[9px] text-zinc-500 block">Aumenta relevância nos algoritmos do Mercado Livre e da Shopee</span>
                  </div>
                  {selectedProduct.attributes_complete ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                </div>

              </div>
            </div>

            {/* Opportunities Box */}
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-850">
              <h4 className="text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Oportunidade de Melhoria para este Anúncio
              </h4>
              <ul className="space-y-2 text-xs text-zinc-400 leading-relaxed list-disc list-inside pl-1">
                {calculateScore(selectedProduct) < 100 ? (
                  <>
                    {!selectedProduct.has_photo && <li>Adicione pelo menos 3 fotos com fundo totalmente branco (exigência dos canais).</li>}
                    {!selectedProduct.has_description && <li>Escreva uma descrição detalhada contendo especificações de garantia e FAQ para tirar dúvidas do cliente.</li>}
                    {!selectedProduct.has_video && <li>Insira um vídeo dinâmico demonstrando o funcionamento do produto para elevar a taxa de conversão em até 18%.</li>}
                    {!selectedProduct.title_valid && <li>Ajuste o título para seguir a fórmula ideal: <b>[Produto] + [Marca] + [Modelo] + [Característica Principal]</b> sem usar pontuações desnecessárias.</li>}
                    {!selectedProduct.attributes_complete && <li>Preencha todos os campos da ficha técnica (marca, EAN/código de barras, dimensões) para evitar ser penalizado pelas buscas do MercadoLíder.</li>}
                  </>
                ) : (
                  <li className="list-none text-emerald-400 font-medium">Parabéns! Este anúncio está com 100% de conformidade técnica e otimização para os marketplaces.</li>
                )}
              </ul>
            </div>

          </div>
        ) : (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-10 text-center text-zinc-500 font-mono">
            Selecione um produto para auditar a qualidade técnica de SEO.
          </div>
        )}
      </div>

    </div>
  );
}
