import { useState, FormEvent } from 'react';
import { Save, HelpCircle, Key, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { SystemConfig } from '../types';

interface SettingsTabProps {
  config: SystemConfig;
  onSaveConfig: (newConfig: SystemConfig) => void;
  isProcessing: boolean;
}

export default function SettingsTab({ config, onSaveConfig, isProcessing }: SettingsTabProps) {
  // Local form states
  const [blingToken, setBlingToken] = useState(config.bling_token);
  
  const [mlClientId, setMlClientId] = useState(config.ml_client_id);
  const [mlClientSecret, setMlClientSecret] = useState(config.ml_client_secret);
  const [mlAccessToken, setMlAccessToken] = useState(config.ml_access_token);

  const [shopeePartnerId, setShopeePartnerId] = useState(config.shopee_partner_id);
  const [shopeePartnerKey, setShopeePartnerKey] = useState(config.shopee_partner_key);
  const [shopeeShopId, setShopeeShopId] = useState(config.shopee_shop_id);
  const [shopeeAccessToken, setShopeeAccessToken] = useState(config.shopee_access_token);

  // Password visibility states
  const [showBlingToken, setShowBlingToken] = useState(false);
  const [showMlSecret, setShowMlSecret] = useState(false);
  const [showMlToken, setShowMlToken] = useState(false);
  const [showShopeeKey, setShowShopeeKey] = useState(false);
  const [showShopeeToken, setShowShopeeToken] = useState(false);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      bling_token: blingToken,
      ml_client_id: mlClientId,
      ml_client_secret: mlClientSecret,
      ml_access_token: mlAccessToken,
      shopee_partner_id: shopeePartnerId,
      shopee_partner_key: shopeePartnerKey,
      shopee_shop_id: shopeeShopId,
      shopee_access_token: shopeeAccessToken
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Configurações e Chaves de API</h2>
        <p className="text-xs text-zinc-400">Configure as credenciais reais do Bling ERP, Mercado Livre e Shopee. O sistema opera em tempo real diretamente com os endpoints das plataformas.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Credentials Form Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Bling block */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              Conexão Bling ERP (v3)
            </h4>

            {/* Input field */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase flex items-center justify-between">
                <span>API Bearer Token (v3)</span>
                <button
                  type="button"
                  onClick={() => setShowBlingToken(!showBlingToken)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showBlingToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </label>
              <input
                type={showBlingToken ? 'text' : 'password'}
                placeholder="Ex: API v3 Bearer Token..."
                value={blingToken}
                onChange={(e) => setBlingToken(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>

            {/* Instructions helper */}
            <div className="text-[10px] text-zinc-500 leading-relaxed space-y-1">
              <p className="font-semibold text-zinc-400 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-zinc-500" /> Como obter:
              </p>
              <p>Acesse seu painel do Bling, vá em <b>Configurações &gt; Integrações &gt; Chaves de API (v3)</b>, clique em gerar Chave de API, escolha permissão completa para Produtos/Estoque e copie o Token gerado aqui.</p>
            </div>
          </div>

          {/* Mercado Livre block */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-mono text-yellow-500 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              Conexão Mercado Livre API
            </h4>

            {/* Client ID */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">App Client ID</label>
              <input
                type="text"
                placeholder="Ex: 58273615482937"
                value={mlClientId}
                onChange={(e) => setMlClientId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>

            {/* Client Secret */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase flex items-center justify-between">
                <span>App Client Secret</span>
                <button
                  type="button"
                  onClick={() => setShowMlSecret(!showMlSecret)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showMlSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </label>
              <input
                type={showMlSecret ? 'text' : 'password'}
                placeholder="Ex: secret-key..."
                value={mlClientSecret}
                onChange={(e) => setMlClientSecret(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>

            {/* Access Token */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase flex items-center justify-between">
                <span>Access Token (Bearer)</span>
                <button
                  type="button"
                  onClick={() => setShowMlToken(!showMlToken)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showMlToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </label>
              <input
                type={showMlToken ? 'text' : 'password'}
                placeholder="Ex: APP_USR-..."
                value={mlAccessToken}
                onChange={(e) => setMlAccessToken(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>

            {/* Instructions helper */}
            <div className="text-[10px] text-zinc-500 leading-relaxed space-y-1">
              <p className="font-semibold text-zinc-400 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-zinc-500" /> Como obter:
              </p>
              <p>Acesse o portal de desenvolvedores do Mercado Livre (Mercado Libre Developers), crie um aplicativo, configure o Redirect URI e gere seu <b>Access Token de Produção</b>.</p>
            </div>
          </div>

          {/* Shopee block */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-mono text-orange-500 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              Conexão Shopee API (v2)
            </h4>

            {/* Partner ID */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Partner ID</label>
              <input
                type="text"
                placeholder="Ex: 10243"
                value={shopeePartnerId}
                onChange={(e) => setShopeePartnerId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>

            {/* Shop ID */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">Shop ID</label>
              <input
                type="text"
                placeholder="Ex: 8573615"
                value={shopeeShopId}
                onChange={(e) => setShopeeShopId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>

            {/* Partner Key */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase flex items-center justify-between">
                <span>Partner Key</span>
                <button
                  type="button"
                  onClick={() => setShowShopeeKey(!showShopeeKey)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showShopeeKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </label>
              <input
                type={showShopeeKey ? 'text' : 'password'}
                placeholder="Ex: partner_key..."
                value={shopeePartnerKey}
                onChange={(e) => setShopeePartnerKey(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>

            {/* Access Token */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase flex items-center justify-between">
                <span>Access Token</span>
                <button
                  type="button"
                  onClick={() => setShowShopeeToken(!showShopeeToken)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showShopeeToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </label>
              <input
                type={showShopeeToken ? 'text' : 'password'}
                placeholder="Ex: Access Token..."
                value={shopeeAccessToken}
                onChange={(e) => setShopeeAccessToken(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>
          </div>

        </div>

        {/* Mode Warn banner */}
        {(!blingToken || !mlAccessToken) && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-xs text-amber-400 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Aviso de Configuração</span>
              <p className="leading-relaxed font-medium">As chaves de API (Token Bling ou Token Mercado Livre) ainda não foram totalmente informadas. O sistema tentará se conectar à API do Bling ou Mercado Livre. Caso as chaves estejam ausentes ou inválidas, ele registrará o erro amigavelmente nos logs de sincronização e manterá o aplicativo funcionando de forma segura.</p>
            </div>
          </div>
        )}

        {/* Submit Save Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors shadow cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isProcessing ? 'Gravando credenciais...' : 'Salvar Configurações'}
          </button>

          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-medium animate-fade-in">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Configurações salvas e aplicadas!
            </div>
          )}
        </div>

      </form>
      
    </div>
  );
}
