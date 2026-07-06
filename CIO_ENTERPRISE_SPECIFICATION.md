# CIO ENTERPRISE - Especificação Funcional

**Versão do Documento:** 1.0.0  
**Data:** 06/07/2026  
**Fonte:** Análise completa do código fonte existente

---

## 1. Visão Geral

### 1.1 Nome do Sistema
CID Enterprise - Centro de Inteligência Operacional

### 1.2 Objetivo
Sistema de conciliação e auditoria para integração entre Bling ERP, Mercado Livre e Shopee. Monitora divergências de estoque, preços e saúde financeira das operações de e-commerce.

### 1.3 Stack Tecnológico
- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Express.js (Node.js)
- **Estilização:** TailwindCSS 4
- **Persistência:** Arquivo JSON local (`db.json`)
- **Ícones:** Lucide React
- **Animações:** Motion (Framer Motion)

### 1.4 Estrutura de Pastas
```
enterprice final/
├── server.ts                 # Backend Express
├── index.html                # HTML principal
├── package.json              # Dependências
├── vite.config.ts            # Configuração Vite
├── tsconfig.json             # Configuração TypeScript
├── metadata.json             # Metadados da aplicação
├── src/
│   ├── main.tsx              # Entry point React
│   ├── App.tsx               # Componente principal
│   ├── index.css             # Estilos globais
│   ├── types.ts              # Definições TypeScript
│   ├── mockData.ts           # Dados iniciais
│   └── components/
│       ├── Header.tsx
│       ├── DashboardTab.tsx
│       ├── MonitorTab.tsx
│       ├── ReconciliationTab.tsx
│       ├── FinanceTab.tsx
│       ├── QualityTab.tsx
│       ├── LogsTab.tsx
│       └── SettingsTab.tsx
```

---

## 2. Banco de Dados

### 2.1 Tipo de Persistência
Arquivo JSON local (`db.json`) - Não utiliza Supabase.

### 2.2 Schema do Banco (DatabaseSchema)
```typescript
interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  apiStatus: APIStatus[];
  logs: LogEntry[];
  finances: FinancialTransaction[];
  config: SystemConfig;
}
```

### 2.3 Tabelas/Entidades

#### Product (Produto)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | string | Identificador único |
| sku | string | Código SKU do produto |
| name | string | Nome do produto |
| bling_stock | number | Estoque no Bling ERP |
| ml_stock | number | Estoque no Mercado Livre |
| shopee_stock | number \| null | Estoque na Shopee (pode ser null) |
| ml_status | string | Status no Mercado Livre |
| shopee_status | string \| null | Status na Shopee (pode ser null) |
| price | number | Preço |
| has_photo | boolean | Possui foto |
| has_description | boolean | Possui descrição |
| has_video | boolean | Possui vídeo |
| title_valid | boolean | Título válido |
| attributes_complete | boolean | Atributos completos |
| image_url | string | URL da imagem |
| ignored_alert | boolean | Alerta ignorado |

#### Order (Pedido)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | string | Identificador único |
| marketplace | 'mercadolivre' \| 'shopee' \| 'bling' | Canal de origem |
| customer | string | Nome do cliente |
| status | 'paid' \| 'new' \| 'invoice_pending' \| 'delivered' \| 'stopped' \| 'picking' \| 'shipped' | Status do pedido |
| date | string | Data do pedido |
| total | number | Valor total |
| items_count | number | Quantidade de itens |
| tracking_code | string \| null | Código de rastreio |

#### APIStatus (Status de API)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | 'bling' \| 'mercadolivre' \| 'shopee' | Identificador da API |
| name | string | Nome da API |
| status | 'active' \| 'warning' \| 'error' | Status atual |
| latency | number | Latência em ms |
| uptime | number | Uptime percentual |
| token_expires | string | Data de expiração do token |
| requests_today | number | Requisições hoje |
| requests_limit | number | Limite de requisições |

#### LogEntry (Log)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | string | Identificador único |
| timestamp | string | Data/hora do evento |
| source | string | Origem do log |
| type | 'info' \| 'success' \| 'warning' \| 'error' | Tipo/Nível |
| message | string | Mensagem principal |
| details | string \| null | Detalhes adicionais |
| payload | string | JSON string para inspeção |

#### FinancialTransaction (Transação Financeira)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | string | Identificador único |
| date | string | Data da transação |
| type | 'income' \| 'expense' | Tipo (receita/despesa) |
| category | string | Categoria |
| description | string | Descrição |
| amount | number | Valor |
| marketplace | 'mercadolivre' \| 'shopee' \| 'bling' \| 'all' | Canal de origem |

#### SystemConfig (Configuração do Sistema)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| bling_token | string | Token Bling ERP |
| ml_client_id | string | Client ID Mercado Livre |
| ml_client_secret | string | Client Secret Mercado Livre |
| ml_access_token | string | Access Token Mercado Livre |
| shopee_partner_id | string | Partner ID Shopee |
| shopee_partner_key | string | Partner Key Shopee |
| shopee_shop_id | string | Shop ID Shopee |
| shopee_access_token | string | Access Token Shopee |

---

## 3. APIs Backend

### 3.1 GET `/api/data`
**Função:** Recuperar estado completo do sistema  
**Método:** GET  
**Autenticação:** Não implementada  
**Resposta:**
```json
{
  "products": Product[],
  "orders": Order[],
  "apiStatus": APIStatus[],
  "logs": LogEntry[],
  "finances": FinancialTransaction[],
  "config": SystemConfig
}
```

### 3.2 POST `/api/config`
**Função:** Atualizar configurações/credenciais  
**Método:** POST  
**Body:** SystemConfig  
**Resposta:**
```json
{
  "success": true,
  "config": SystemConfig,
  "logs": LogEntry[],
  "products": Product[],
  "orders": Order[],
  "finances": FinancialTransaction[]
}
```
**Efeito colateral:** Adiciona log de sistema sobre atualização de configurações

### 3.3 POST `/api/reconcile`
**Função:** Correção individual de reconciliação  
**Método:** POST  
**Body:**
```json
{
  "productId": string,
  "action": "bling" | "channel" | "ignore",
  "canal": "mercadolivre" | "shopee"
}
```
**Resposta:**
```json
{
  "success": true,
  "products": Product[],
  "logs": LogEntry[]
}
```
**Efeito colateral:** 
- Se `action === "bling"`: Atualiza `bling_stock` do produto
- Se `action === "channel"`: Atualiza `ml_stock` ou `shopee_stock`
- Se `action === "ignore"`: Marca `ignored_alert = true`
- Adiciona log de conciliação

### 3.4 POST `/api/reconcile-bulk`
**Função:** Correção em lote de reconciliação  
**Método:** POST  
**Body:**
```json
{
  "productIds": string[],
  "direction": "to_bling" | "to_channel"
}
```
**Resposta:**
```json
{
  "success": true,
  "products": Product[],
  "logs": LogEntry[]
}
```
**Efeito colateral:**
- Se `direction === "to_bling"`: Sincroniza estoque do canal para o Bling
- Se `direction === "to_channel"`: Envia estoque do Bling para os canais
- Adiciona log de correção em lote

### 3.5 POST `/api/finances`
**Função:** Adicionar transação financeira manual  
**Método:** POST  
**Body:** Omit<FinancialTransaction, 'id'>  
**Resposta:**
```json
{
  "success": true,
  "finances": FinancialTransaction[],
  "logs": LogEntry[]
}
```
**Efeito colateral:** Adiciona nova transação e log financeiro

### 3.6 POST `/api/sync`
**Função:** Sincronização global de APIs  
**Método:** POST  
**Resposta:**
```json
{
  "success": boolean,
  "products": Product[],
  "apiStatus": APIStatus[],
  "logs": LogEntry[],
  "orders": Order[],
  "message": string
}
```
**Efeito colateral:** 
- Busca produtos reais do Bling (se token configurado)
- Busca anúncios reais do Mercado Livre (se token configurado)
- Busca pedidos reais de ambas as APIs
- Atualiza status das APIs
- Adiciona log de sincronização

---

## 4. Telas do Sistema

### 4.1 Header (Cabeçalho)
**Arquivo:** `src/components/Header.tsx`

#### Informações Exibidas
- Logo "CI" com identificação "CID Enterprise v1.2.0"
- Subtítulo: "Centro de Inteligência Operacional • Bling ERP, Mercado Livre & Shopee"
- Indicador de canal ativo: "Bling ERP Hub"
- Badge de modo: "PRODUÇÃO API"
- Horário da última atualização

#### Botões Existentes

| Nome | Função | Evento | Status |
|------|--------|--------|--------|
| Sincronizar Tudo | Dispara sincronização global | onClick → onSync() | Funciona |

#### Props Recebidas
- `isSyncing: boolean` - Estado de sincronização
- `onSync: () => void` - Callback de sincronização
- `lastSyncTime: string` - Timestamp da última sincronização

---

### 4.2 DashboardTab (Painel Geral)
**Arquivo:** `src/components/DashboardTab.tsx`  
**ID da Tab:** `dashboard`

#### Objetivo
Visão consolidada da operação com KPIs de severidade de divergências.

#### Informações Exibidas

##### Banner Superior
- Título: "Centro de Inteligência Operacional (CIO)"
- Descrição explicativa do sistema

##### Cards de Severidade (4 Cards)

**1. Divergências Críticas**
- Cor: Vermelho
- Ícone: Ban
- Cálculo: Produtos onde `bling_stock === 0` e `(ml_stock > 0 || shopee_stock > 0)`
- Origem: Array `products`

**2. Divergências Altas**
- Cor: Âmbar
- Ícone: AlertTriangle
- Cálculo: Produtos com divergência em ambos os canais
- Origem: Array `products`

**3. Divergências Médias**
- Cor: Amarelo
- Ícone: ShieldAlert
- Cálculo: Produtos com divergência em pelo menos um canal
- Origem: Array `products`

**4. Qualidade do Anúncio**
- Cor: Azul
- Ícone: Zap
- Cálculo: Produtos sem foto, descrição, título válido ou atributos completos
- Origem: Array `products`

##### Cards de Produtividade (3 Cards)

**1. Pedidos Sincronizados Hoje**
- Ícone: ShoppingBag
- Cálculo: Orders onde data.startsWith('2026-07-06')
- Origem: Array `orders`

**2. Pedidos Retidos/Bloqueados**
- Ícone: Ban
- Cálculo: Orders onde `status === 'stopped' || status === 'invoice_pending'`
- Origem: Array `orders`

**3. Correções Efetuadas**
- Ícone: CheckCircle2
- Cálculo: Logs onde message.includes('corrigido') ou message.includes('Correção')
- Origem: Array `logs`

##### Mapeamento de Saúde de Catálogo
- Barra de progresso Bling ERP: 100% do total de produtos
- Barra de progresso Mercado Livre: % de produtos com ml_status === 'active'
- Barra de progresso Shopee: % de produtos com shopee_status === 'active'

##### Atividades Recentes
- Lista dos 3 últimos logs
- Exibe: source, message, details
- Origem: Array `logs`

#### Botões Existentes

| Nome | Função | Evento | Redireciona |
|------|--------|--------|-------------|
| Conciliar Divergências | Navega para aba de conciliação | onClick → setActiveTab('reconciler') | Tab Reconciler |
| Ver Logs Completos | Navega para aba de logs | onClick → setActiveTab('logs') | Tab Logs |

#### Clique nos Cards de Severidade
- Todos os cards de severidade são clicáveis
- Redirecionam para tab 'reconciler' (exceto Qualidade → 'quality')

---

### 4.3 ReconciliationTab (Conciliação)
**Arquivo:** `src/components/ReconciliationTab.tsx`  
**ID da Tab:** `reconciler`

#### Objetivo
Auditar e corrigir discrepâncias de estoque e preços entre Bling ERP e marketplaces.

#### Campos de Filtro

| Campo | Tipo | Options |
|-------|------|---------|
| Pesquisa | Input text | Filtra por SKU ou nome |
| Canal | Select | 'Todos os Canais', 'Mercado Livre', 'Shopee' |
| Filtro | Select | 'Com Divergência', 'Sincronizados', 'Silenciados/Ignorados', 'Todos os Itens' |

#### Tabela de Produtos

##### Colunas Exibidas
1. Checkbox de seleção
2. Produto/SKU (com imagem, nome e SKU)
3. Preço
4. Bling ERP (estoque)
5. Mercado Livre (estoque + badge de diferença)
6. Shopee (estoque + badge de diferença)
7. Ações de Resolução

#### Indicadores Visuais
- Badge "Dif: X" em âmbar quando há divergência
- Badge "Sincronizado" em verde quando sem divergência

#### Botões Existentes

| Nome | Função | Condição | Evento |
|------|--------|----------|--------|
| Checkbox individual | Seleciona produto para ação em lote | Sempre | onClick → toggleSelect(id) |
| Checkbox header | Seleciona/deseleciona todos | Sempre | onClick → toggleSelectAll() |
| Corrige no Bling | Puxa estoque do canal para o Bling | Produto com divergência | onClick → onReconcile(id, 'bling', canal) |
| Corrige no Canal | Envia estoque do Bling para o canal | Produto com divergência | onClick → onReconcile(id, 'channel', canal) |
| Ignorar (EyeOff) | Silencia alerta de divergência | Produto com divergência | onClick → onReconcile(id, 'ignore', 'mercadolivre') |
| Sincronizar no Bling (Puxar) | Ação em lote - direção to_bling | Produtos selecionados | onClick → handleBulkAction('to_bling') |
| Atualizar Canais (Empurrar) | Ação em lote - direção to_channel | Produtos selecionados | onClick → handleBulkAction('to_channel') |

#### Barra de Ação em Lote
- Aparece quando `selectedIds.length > 0`
- Exibe quantidade de produtos selecionados
- Botões de ação em lote

#### Estados Possíveis da Tabela
- Linhas com produtos filtrados
- Mensagem "Nenhuma divergência encontrada com os filtros selecionados." quando vazio

---

### 4.4 MonitorTab (Central de APIs)
**Arquivo:** `src/components/MonitorTab.tsx`  
**ID da Tab:** `monitor`

#### Objetivo
Exibir status em tempo real das conexões de API.

#### Informações Exibidas

##### Cards de API (3 Cards)

**1. Bling ERP**
- ID: 'bling'
- Status: active/warning/error
- Latência: em ms
- Uptime mensal: percentual
- Gráfico sparkline SVG com histórico de latência
- Barra de consumo: requests_today / requests_limit

**2. Mercado Livre API**
- ID: 'mercadolivre'
- Mesma estrutura do Bling

**3. Shopee API v2**
- ID: 'shopee'
- Mesma estrutura do Bling

##### Elementos de Cada Card
- Badge de status: "Ativa/Saudável" ou "Ondulando/Error"
- Latência (ms ou "Timeout")
- Uptime (%)
- Gráfico SVG sparkline com histórico recente
- Barra de progresso de consumo da API

#### Botões Existentes

| Nome | Função | Evento | Status |
|------|--------|--------|--------|
| Testar Latência | Dispara sincronização | onClick → onSync() | Funciona |

#### Gráfico Sparkline
- Renderizado via SVG
- Atualizado a cada 15 segundos (useEffect interval)
- Mantém histórico de 10 pontos
- Gradiente de preenchimento

---

### 4.5 FinanceTab (Financeiro)
**Arquivo:** `src/components/FinanceTab.tsx`  
**ID da Tab:** `finances`

#### Objetivo
Painel de auditoria e fluxo financeiro com controle de despesas por categoria.

#### Filtros Multiseleção

##### Presets Rápidos
| Nome | Ação |
|------|------|
| Consolidado | Ativa todos os canais |
| Só ML | Apenas Mercado Livre |
| Só Shopee | Apenas Shopee |
| Só Bling | Apenas Bling ERP |

##### Toggles de Canal
| Botão | Estado |
|-------|--------|
| Mercado Livre | Toggle on/off com ícone Eye/EyeOff |
| Shopee | Toggle on/off com ícone Eye/EyeOff |
| Bling ERP | Toggle on/off com ícone Eye/EyeOff |
| Despesas Compartilhadas/Impostos | Toggle on/off |

#### KPIs Financeiros (4 Cards)

| Nome | Cálculo | Ícone |
|------|---------|-------|
| Faturamento Bruto | Soma de transações type='income' filtradas | ArrowUpRight |
| Despesas Totais | Soma de transações type='expense' filtradas | ArrowDownRight |
| Resultado Líquido | Faturamento - Despesas | ArrowUpRight/Down (condicional) |
| Margem Operacional | (Resultado / Faturamento) * 100 | Percent |

#### Gráficos

**1. Evolução do Saldo Consolidado**
- Tipo: SVG line chart
- Eixo X: Datas do timeline
- Eixo Y: Valores de receita/despesa
- Escala ajustada pelo valor máximo
- Linha verde: Faturamento
- Linha vermelha: Despesas

**2. Distribuição de Despesas por Categoria**
- Tipo: Barras horizontais de progresso
- Categorias:
  - Impostos
  - Logística e Frete
  - Marketing e Tráfego
  - Taxas do Marketplace
  - Custo de Produto (COGS)
  - Assinaturas e Ferramentas

#### Tabela de Histórico de Transações
- Scroll máximo: 220px
- Colunas: Ícone, Descrição, Data/Categoria, Valor, Canal

#### Formulário de Lançamento Manual

##### Campos
| Nome | Tipo | Valores |
|------|------|---------|
| Tipo | Segmented control | Despesa / Receita |
| Categoria (Despesa) | Select | COGS, Taxas, Impostos, Logística, Marketing, Assinaturas |
| Categoria (Receita) | Select | Vendas, Reembolsos, Ajustes de Caixa |
| Canal Origem | Select | Mercado Livre, Shopee, Bling, Todas |
| Descrição | Input text | Obrigatório |
| Valor | Input number | Obrigatório, step 0.01 |

##### Botão
| Nome | Função | Validação |
|------|--------|-----------|
| Registrar Lançamento | Adiciona transação | Campos obrigatórios preenchidos |

---

### 4.6 QualityTab (Qualidade Anúncios)
**Arquivo:** `src/components/QualityTab.tsx`  
**ID da Tab:** `quality`

#### Objetivo
Auditar conformidade de SEO dos anúncios ativos.

#### Layout
- Coluna esquerda (1/3): Lista de produtos
- Coluna direita (2/3): Detalhes do produto selecionado

#### Lista de Produtos
- Campo de pesquisa por SKU ou nome
- Item exibe: imagem, nome, SKU, score %
- Scroll máximo: 360px

#### Cálculo do Score
```
Score base: 20
+ 20 se has_photo
+ 20 se has_description
+ 20 se has_video
+ 10 se title_valid
+ 10 se attributes_complete
= Máximo 100%
```

#### Cores do Score
- Verde: >= 80%
- Âmbar: >= 50%
- Vermelho: < 50%

#### Checklist de Auditoria (Detalhes)

| Critério | Condição | Ícone OK | Ícone Falha |
|----------|----------|----------|-------------|
| Fotos do Produto | has_photo | CheckCircle2 | XCircle |
| Ficha & Descrição Técnica | has_description | CheckCircle2 | XCircle |
| Mídia Dinâmica (Vídeo) | has_video | CheckCircle2 | XCircle |
| Título do Anúncio | title_valid | CheckCircle2 | XCircle |
| Atributos e Ficha Técnica | attributes_complete | CheckCircle2 | XCircle |

#### Oportunidades de Melhoria
- Lista dinâmica baseada nos critérios falhando
- Se score = 100%: mensagem de parabenização

#### Botões Existentes
| Nome | Função | Evento |
|------|--------|--------|
| Item da lista | Seleciona produto | onClick → setSelectedProduct(p) |

---

### 4.7 LogsTab (Logs Integração)
**Arquivo:** `src/components/LogsTab.tsx`  
**ID da Tab:** `logs`

#### Objetivo
Rastreio em tempo real e auditoria técnica de requisições HTTP e payloads.

#### Filtros

| Campo | Tipo | Valores |
|-------|------|---------|
| Pesquisa | Input text | Busca em message e details |
| Origem | Select | Todas, Sistema, Bling, Mercado Livre, Shopee |
| Severidade | Select | Todos, info, success, warning, error |

#### Lista de Logs (Accordion)
- Cada item expansível
- Exibe: ícone, source badge, message, details (opcional), timestamp
- Se expandido: exibe payload JSON

#### Ícones por Tipo
| Tipo | Ícone | Cor |
|------|-------|-----|
| success | CheckCircle | Verde |
| info | Info | Azul |
| warning | AlertTriangle | Âmbar |
| error | AlertTriangle | Vermelho |

#### Funcionalidade de Cópia
- Botão "Copiar JSON" no payload expandido
- Copia payload para clipboard
- Feedback visual: "Copiado" por 2 segundos

#### Botões Existentes
| Nome | Função | Evento |
|------|--------|--------|
| Header do log | Expande/recolhe payload | onClick → toggle expanded |
| Copiar JSON | Copia payload | onClick → clipboard.writeText() |

---

### 4.8 SettingsTab (Chaves de API)
**Arquivo:** `src/components/SettingsTab.tsx`  
**ID da Tab:** `settings`

#### Objetivo
Configurar credenciais reais das APIs de integração.

#### Blocos de Configuração (3 Colunas)

##### 1. Bling ERP (v3)
| Campo | Tipo | Toggle Visibilidade |
|-------|------|---------------------|
| API Bearer Token | password/text | Sim |

Instrução incluída no componente.

##### 2. Mercado Livre API
| Campo | Tipo | Toggle Visibilidade |
|-------|------|---------------------|
| App Client ID | text | Não |
| App Client Secret | password/text | Sim |
| Access Token (Bearer) | password/text | Sim |

Instrução incluída no componente.

##### 3. Shopee API (v2)
| Campo | Tipo | Toggle Visibilidade |
|-------|------|---------------------|
| Partner ID | text | Não |
| Shop ID | text | Não |
| Partner Key | password/text | Sim |
| Access Token | password/text | Sim |

#### Banner de Aviso
- Condicional: Exibido se `!blingToken || !mlAccessToken`
- Mensagem sobre chaves ausentes ou inválidas
- Estilo: âmbar/alerta

#### Botões Existentes
| Nome | Função | Validação | Evento |
|------|--------|-----------|--------|
| Salvar Configurações | Salva todas as credenciais | Formulário válido | onSubmit → onSaveConfig() |

#### Feedback de Sucesso
- Badge "Configurações salvas e aplicadas!" exibido por 3 segundos após save

---

## 5. Navegação

### 5.1 Sidebar Navigation
**Arquivo:** `src/App.tsx`

#### Itens de Navegação
| ID | Label | Ícone |
|----|-------|-------|
| dashboard | Painel Geral | LayoutDashboard |
| reconciler | Conciliação | ArrowLeftRight |
| monitor | Central de APIs | Activity |
| finances | Financeiro | DollarSign |
| quality | Qualidade Anúncios | CheckSquare |
| logs | Logs Integração | Terminal |
| settings | Chaves de API | Settings |

#### Comportamento
- Horizontal scroll em mobile
- Vertical em desktop (md:w-60)
- Tab ativa: bg-zinc-900, border, text-emerald-400 no ícone

---

## 6. Integrações

### 6.1 Bling ERP API v3

#### Fluxo Implementado
- Busca de produtos: `fetchBlingProducts(token)`
- Busca de pedidos: `fetchBlingOrders(token)`

#### Endpoints Utilizados
| Endpoint | Método | Uso |
|----------|--------|-----|
| `https://api.bling.com.br/v3/produtos?pagina=1&limite=100` | GET | Buscar produtos |
| `https://api.bling.com.br/v3/pedidos/vendas?pagina=1&limite=10` | GET | Buscar pedidos |

#### Autenticação
- Bearer Token (header: `Authorization: Bearer ${token}`)
- Token fornecido via configurações do sistema

#### Mapeamento de Produtos
```javascript
{
  sku: item.codigo || '',
  stock: item.estoque?.saldoFisicoTotal ?? 0,
  price: item.preco ?? 0,
  name: item.nome || ''
}
```

#### Mapeamento de Status de Pedido
| Situação ID (Bling) | Status CID |
|--------------------|------------|
| 9 | delivered |
| 6 | paid |
| 12 | invoice_pending |
| outros | new |

#### OAuth/Refresh Token
**Não implementado.**

---

### 6.2 Mercado Livre API

#### Fluxo Implementado
- Identificação de usuário: `getMercadoLivreUserId(accessToken)`
- Busca de anúncios: `fetchMercadoLivreItems(accessToken)`
- Busca de pedidos: `fetchMercadoLivreOrders(accessToken, userId)`

#### Endpoints Utilizados
| Endpoint | Método | Uso |
|----------|--------|-----|
| `https://api.mercadolibre.com/users/me` | GET | Obter ID do usuário |
| `https://api.mercadolibre.com/users/{userId}/items/search?limit=50` | GET | Listar IDs de anúncios |
| `https://api.mercadolibre.com/items/{itemId}` | GET | Detalhes do anúncio |
| `https://api.mercadolibre.com/orders/search?seller={userId}&limit=10` | GET | Buscar pedidos |

#### Autenticação
- Access Token (header: `Authorization: Bearer ${accessToken}`)
- Token fornecido via configurações do sistema

#### Mapeamento de Anúncios
```javascript
{
  id: d.id,
  sku: d.seller_custom_field ou attributes.SELLER_SKU,
  stock: d.available_quantity,
  status: d.status,
  price: d.price
}
```

#### Mapeamento de Status de Pedido
| Status ML | Status CID |
|-----------|------------|
| paid | paid |
| delivered | delivered |
| cancelled | stopped |
| shipped | shipped |
| outros | new |

#### OAuth/Refresh Token
**Não implementado.**

---

### 6.3 Shopee API

#### Status
**Parcialmente implementado.**

#### Campo de Config
- shopee_partner_id
- shopee_partner_key
- shopee_shop_id
- shopee_access_token

#### Função de Fetch
**Não implementada.** Não existe função `fetchShopeeItems()` no server.ts.

#### Mapeamento de Status
- Definido no tipo: `shopee_status: string | null`
- Valores usados no mockData: 'active', 'paused', 'not_listed', null

---

## 7. Edge Functions

**Não implementado.**

O projeto não utiliza Supabase Edge Functions. Todas as operações são realizadas no servidor Express local (`server.ts`).

---

## 8. Fluxos

### 8.1 Fluxo de Inicialização

```
App.tsx (mount)
  → fetchInitialData()
    → GET /api/data
      → loadDatabase()
        → Lê db.json ou inicializa vazio
      → Retorna: products, orders, apiStatus, logs, finances, config
  → Estados atualizados
  → Renderiza DashboardTab
```

### 8.2 Fluxo de Sincronização Global

```
Header: Botão "Sincronizar Tudo"
  → onSync()
    → POST /api/sync
      → Se bling_token configurado:
        → fetchBlingProducts(token)
        → fetchBlingOrders(token)
      → Se ml_access_token configurado:
        → getMercadoLivreUserId(token)
        → fetchMercadoLivreItems(token)
        → fetchMercadoLivreOrders(token, userId)
      → Merge produtos Bling + ML
      → Salva produtos em db.products
      → Salva pedidos em db.orders
      → Atualiza apiStatus (latência, status)
      → Gera log de sincronização
      → Salva db.json
    → Retorna: products, apiStatus, logs, orders
  → Estados atualizados
```

### 8.3 Fluxo de Conciliação Individual

```
ReconciliationTab: Botão "Corrige no Bling"
  → onReconcile(productId, 'bling', canal)
    → POST /api/reconcile { productId, action: 'bling', canal }
      → Busca produto pelo ID
      → Atualiza bling_stock com valor do canal
      → Gera log de correção
      → Salva db.json
    → Retorna: products, logs
  → Estados atualizados
```

### 8.4 Fluxo de Conciliação em Lote

```
ReconciliationTab: Seleção múltipla + "Atualizar Canais"
  → handleBulkAction('to_channel')
    → POST /api/reconcile-bulk { productIds, direction: 'to_channel' }
      → Para cada productId:
        → Atualiza ml_stock = bling_stock
        → Se shopee_stock !== null: shopee_stock = bling_stock
      → Gera log de correção em lote
      → Salva db.json
    → Retorna: products, logs
  → Estados atualizados
  → Limpa seleção
```

### 8.5 Fluxo de Lançamento Financeiro

```
FinanceTab: Formulário preenchido + "Registrar Lançamento"
  → handleSubmit()
    → onAddTransaction({ date, type, category, description, amount, marketplace })
      → POST /api/finances
        → Gera ID único
        → Adiciona ao início de db.finances
        → Gera log financeiro
        → Salva db.json
      → Retorna: finances, logs
    → Estados atualizados
    → Formulário resetado
```

### 8.6 Fluxo de Salvamento de Configurações

```
SettingsTab: Formulário preenchido + "Salvar Configurações"
  → handleSubmit()
    → onSaveConfig(newConfig)
      → POST /api/config
        → Atualiza db.config
        → Gera log de sistema
        → Salva db.json
      → Retorna: config, logs, products, orders, finances
    → Estados atualizados
    → Feedback visual de sucesso
```

---

## 9. Logs

### 9.1 Tipos de Log

| Tipo | Cor | Uso |
|------|-----|-----|
| info | Azul | Informações gerais, sincronizações |
| success | Verde | Operações bem-sucedidas |
| warning | Âmbar | Alertas, retries |
| error | Vermelho | Falhas de conexão |

### 9.2 Sources Disponíveis

| Source | Uso |
|--------|-----|
| Sistema | Logs do próprio CID |
| Bling | Logs de integração Bling |
| Mercado Livre | Logs de integração ML |
| Shopee | Logs de integração Shopee |

### 9.3 Logs Gerados pelo Sistema

| Ação | Source | Type | Message |
|------|--------|------|---------|
| Inicialização | Sistema | info | "Dados de simulação..." |
| Atualização config | Sistema | info | "Configurações atualizadas..." |
| Correção individual | Bling/ML/Shopee | success | "Estoque corrigido no..." |
| Ignorar alerta | Sistema | info | "Alerta de divergência ignorado..." |
| Correção em lote | Sistema | success | "Correção em lote efetuada..." |
| Lançamento financeiro | Sistema | success | "Lançamento financeiro adicionado" |
| Sincronização | Sistema | success/warning | "Sincronização global..." |
| Erro de API | Sistema | error | "Falha na API do..." |

---

## 10. Tratamento de Erros

### 10.1 Backend (server.ts)

| Situação | Tratamento |
|----------|------------|
| db.json corrompido | Reinicializa com dados vazios |
| Erro na API Bling | Log de erro, status = 'error', latency = 999 |
| Erro na API ML | Log de erro, status = 'error', latency = 999 |
| Produto não encontrado | Retorna 404 com mensagem |
| Erro de parsing | Catch com console.error |

### 10.2 Frontend (App.tsx)

| Situação | Tratamento |
|----------|------------|
| Falha ao carregar dados | Tela de erro com botão "Tentativa Novamente" |
| Estado loading | Spinner com mensagem |
| Falha em reconciliation | alert() com mensagem |
| Falha em sync | alert() com mensagem |

---

## 11. Funcionalidades Não Implementadas

### 11.1 Autenticação de Usuário
**Não implementado.** Sistema não possui login/autenticação.

### 11.2 OAuth / Refresh Token
**Não implementado.** Os tokens são estáticos e inseridos manualmente.

### 11.3 Shopee API Fetch
**Não implementado.** Não existe função de busca de produtos/pedidos da Shopee.

### 11.4 Persistência em Supabase
**Não implementado.** Utiliza arquivo JSON local.

### 11.5 Edge Functions
**Não implementado.** Não utiliza Supabase Edge Functions.

### 11.6 Webhooks
**Não implementado.** Não há endpoints para webhooks dos marketplaces.

### 11.7 Atualização Real via API (PUT/POST)
**Não implementado.** As correções de reconciliação são locais apenas. Não empurram dados para as APIs externas. Apenas simulam a correção localmente.

### 11.8 Gráfico Financeiro Dinâmico
**Parcialmente implementado.** O gráfico de evolução temporal usa dados estáticos hardcoded no `timelineData`, não dados reais do banco.

---

## 12. Dados de Exemplo (mockData.ts)

### 12.1 initialProducts
- 8 produtos de exemplo
- Categorias: SSD, Fone, Carregador, Mouse, Teclado, Smartwatch, Cabo, Ring Light

### 12.2 initialOrders
- 7 pedidos de exemplo
- Mix de status e marketplaces

### 12.3 initialAPIStatus
- 3 APIs: Bling, Mercado Livre, Shopee
- Status inicial: 'active'

### 12.4 initialLogs
- 8 logs de exemplo
- Mix de tipos e sources

### 12.5 initialFinances
- 11 transações de exemplo
- Mix de income e expense

### 12.6 initialConfig
- Todos os campos vazios por padrão

---

## 13. Animações

### 13.1 CSS
Definido em `src/index.css`:
- `.animate-fade-in`: Fade in com translateY (0.4s)

### 13.2 Motion Library
Utilizada para transições:
- Ícone de sincronização: animate-spin
- Badge PLAY: animate-pulse
- Indicador de status: animate-pulse

---

## 14. Responsividade

### 14.1 Breakpoints Utilizados
- Mobile: padrão
- SM: `sm:`
- MD: `md:`
- LG: `lg:`

### 14.2 Adaptações
- Sidebar: horizontal em mobile, vertical em desktop
- Grid de cards: 1 coluna mobile, múltiplas em desktop
- Tabelas: scroll horizontal

---

**Fim do Documento**

---

*Este documento representa exclusivamente o estado atual do código fonte do CIO Enterprise. Funcionalidades não descritas neste documento não estão implementadas.*
