import { Product, Order, APIStatus, LogEntry, FinancialTransaction, SystemConfig } from './types';

export const initialProducts: Product[] = [
  {
    id: "1",
    sku: "AXY-SSD-1TB",
    name: "SSD Kingston NV2 1TB NVMe M.2 2280",
    bling_stock: 0,
    ml_stock: 10,
    shopee_stock: 0,
    ml_status: "active",
    shopee_status: "not_listed",
    price: 349.9,
    has_photo: true,
    has_description: true,
    has_video: false,
    title_valid: true,
    attributes_complete: true,
    image_url: "https://images.unsplash.com/photo-1597872200919-0127a4b10165?w=150&auto=format&fit=crop&q=60",
    ignored_alert: false
  },
  {
    id: "2",
    sku: "AXY-FONE-BLU",
    name: "Fone de Ouvido Bluetooth JBL Wave Flex",
    bling_stock: 15,
    ml_stock: 0,
    shopee_stock: 15,
    ml_status: "paused",
    shopee_status: "active",
    price: 279,
    has_photo: true,
    has_description: true,
    has_video: true,
    title_valid: true,
    attributes_complete: true,
    image_url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=150&auto=format&fit=crop&q=60",
    ignored_alert: false
  },
  {
    id: "3",
    sku: "AXY-CHARG-20W",
    name: "Carregador de Parede Anker Nano 20W USB-C",
    bling_stock: 10,
    ml_stock: 8,
    shopee_stock: 10,
    ml_status: "active",
    shopee_status: "active",
    price: 89.9,
    has_photo: true,
    has_description: true,
    has_video: false,
    title_valid: true,
    attributes_complete: true,
    image_url: "https://images.unsplash.com/photo-1622445262465-2481c4574875?w=150&auto=format&fit=crop&q=60",
    ignored_alert: false
  },
  {
    id: "4",
    sku: "AXY-MOUSE-GAM",
    name: "Mouse Gamer Redragon Cobra M711 RGB 10000DPI",
    bling_stock: 25,
    ml_stock: 25,
    shopee_stock: 25,
    ml_status: "active",
    shopee_status: "active",
    price: 139.9,
    has_photo: false,
    has_description: true,
    has_video: false,
    title_valid: false,
    attributes_complete: false,
    image_url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=150&auto=format&fit=crop&q=60",
    ignored_alert: false
  },
  {
    id: "5",
    sku: "AXY-KEY-MECA",
    name: "Teclado Mecânico Gamer Redragon Kumara Switch Outemu Blue",
    bling_stock: 8,
    ml_stock: 8,
    shopee_stock: 12,
    ml_status: "active",
    shopee_status: "active",
    price: 249.9,
    has_photo: true,
    has_description: false,
    has_video: false,
    title_valid: true,
    attributes_complete: true,
    image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&auto=format&fit=crop&q=60",
    ignored_alert: false
  },
  {
    id: "6",
    sku: "AXY-SMART-W3",
    name: "Smartwatch Genérico W34 Ultra Series 9",
    bling_stock: 0,
    ml_stock: 5,
    shopee_stock: null,
    ml_status: "active",
    shopee_status: null,
    price: 199.9,
    has_photo: true,
    has_description: true,
    has_video: false,
    title_valid: true,
    attributes_complete: false,
    image_url: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=150&auto=format&fit=crop&q=60",
    ignored_alert: false
  },
  {
    id: "7",
    sku: "AXY-CABLE-LIG",
    name: "Cabo USB-C para Lightning Belkin 1.2m Certificado MFi",
    bling_stock: 45,
    ml_stock: 45,
    shopee_stock: 45,
    ml_status: "active",
    shopee_status: "active",
    price: 79.9,
    has_photo: true,
    has_description: true,
    has_video: false,
    title_valid: true,
    attributes_complete: true,
    image_url: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=150&auto=format&fit=crop&q=60",
    ignored_alert: false
  },
  {
    id: "8",
    sku: "AXY-RING-LED",
    name: "Ring Light LED 10 polegadas com Tripé Articulado",
    bling_stock: 18,
    ml_stock: 18,
    shopee_stock: 0,
    ml_status: "active",
    shopee_status: "paused",
    price: 59.9,
    has_photo: true,
    has_description: true,
    has_video: false,
    title_valid: true,
    attributes_complete: true,
    image_url: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=150&auto=format&fit=crop&q=60",
    ignored_alert: false
  }
];

export const initialOrders: Order[] = [
  {
    id: "PED-1024",
    marketplace: "mercadolivre",
    customer: "Carlos Eduardo Silva",
    status: "paid",
    date: "2026-07-06T10:14:00",
    total: 349.9,
    items_count: 1,
    tracking_code: "ML987654321BR"
  },
  {
    id: "PED-1025",
    marketplace: "shopee",
    customer: "Mariana Costa Ferreira",
    status: "new",
    date: "2026-07-06T11:45:00",
    total: 179.8,
    items_count: 2,
    tracking_code: null
  },
  {
    id: "PED-1026",
    marketplace: "mercadolivre",
    customer: "Juliano Barbosa Neto",
    status: "invoice_pending",
    date: "2026-07-06T12:02:00",
    total: 89.9,
    items_count: 1,
    tracking_code: "ML987654322BR"
  },
  {
    id: "PED-1027",
    marketplace: "bling",
    customer: "Ana Paula Rocha (Venda Balcão)",
    status: "delivered",
    date: "2026-07-05T14:30:00",
    total: 279,
    items_count: 1,
    tracking_code: null
  },
  {
    id: "PED-1028",
    marketplace: "shopee",
    customer: "Thiago Mendes de Souza",
    status: "stopped",
    date: "2026-07-06T08:15:00",
    total: 249.9,
    items_count: 1,
    tracking_code: null
  },
  {
    id: "PED-1029",
    marketplace: "mercadolivre",
    customer: "Lucas Silveira Camargo",
    status: "picking",
    date: "2026-07-06T13:30:00",
    total: 398.9,
    items_count: 3,
    tracking_code: "ML987654323BR"
  },
  {
    id: "PED-1030",
    marketplace: "shopee",
    customer: "Roberta Almeida Cruz",
    status: "shipped",
    date: "2026-07-05T09:12:00",
    total: 79.9,
    items_count: 1,
    tracking_code: "SP982736154BR"
  }
];

export const initialAPIStatus: APIStatus[] = [
  {
    id: "bling",
    name: "Bling ERP",
    status: "active",
    latency: 124,
    uptime: 99.8,
    token_expires: "2026-08-15T23:59:59",
    requests_today: 1420,
    requests_limit: 10000
  },
  {
    id: "mercadolivre",
    name: "Mercado Livre API",
    status: "active",
    latency: 185,
    uptime: 99.9,
    token_expires: "2026-07-12T14:22:00",
    requests_today: 3240,
    requests_limit: 20000
  },
  {
    id: "shopee",
    name: "Shopee API v2",
    status: "active",
    latency: 290,
    uptime: 99.5,
    token_expires: "2026-09-01T12:00:00",
    requests_today: 850,
    requests_limit: 5000
  }
];

export const initialLogs: LogEntry[] = [
  {
    id: "log-1783318783136-7ru2d",
    timestamp: "2026-07-06T06:19:43.136Z",
    source: "Sistema",
    type: "info",
    message: "Dados de simulação e demonstração restaurados.",
    details: "Iniciado banco de dados em memória local com 8 SKUs e 7 Pedidos.",
    payload: JSON.stringify({ event: "init", products_loaded: 8, orders_loaded: 7, status: "SUCCESS" }, null, 2)
  },
  {
    id: "log-1",
    timestamp: "2026-07-06T13:45:12Z",
    source: "Sistema",
    type: "success",
    message: "Auditoria de conciliação finalizada com sucesso.",
    details: "Verificados 8 SKUs ativos. Identificadas 4 divergências de estoque.",
    payload: JSON.stringify({ verified_skus: 8, active_discrepancies: 4, run_time_ms: 154 }, null, 2)
  },
  {
    id: "log-2",
    timestamp: "2026-07-06T13:30:00Z",
    source: "Mercado Livre",
    type: "info",
    message: "Pedidos importados do Mercado Livre.",
    details: "Importados 2 novos pedidos (PED-1029, PED-1026).",
    payload: JSON.stringify({
      channel: "mercado_livre",
      imported_orders: ["PED-1029", "PED-1026"],
      total_amount: 488.80,
      sync_status: "SUCCESS"
    }, null, 2)
  },
  {
    id: "log-3",
    timestamp: "2026-07-06T13:00:00Z",
    source: "Shopee",
    type: "info",
    message: "Produtos sincronizados com a Shopee.",
    details: "Retornados 7 anúncios vinculados.",
    payload: JSON.stringify({
      channel: "shopee",
      items_pulled: 7,
      status: "SUCCESS"
    }, null, 2)
  },
  {
    id: "log-4",
    timestamp: "2026-07-06T12:15:33Z",
    source: "Bling",
    type: "warning",
    message: "Dificuldade de conexão temporária com API do Bling.",
    details: "Timeout de 10s excedido na rota /produtos. Efetuando nova tentativa automática (Retry 1).",
    payload: JSON.stringify({
      error: "Gateway Timeout",
      code: 504,
      target_url: "https://api.bling.com.br/v3/produtos",
      timeout_seconds: 10,
      retry_count: 1
    }, null, 2)
  },
  {
    id: "log-5",
    timestamp: "2026-07-06T12:15:45Z",
    source: "Bling",
    type: "success",
    message: "Conexão restabelecida com API do Bling após retry.",
    details: "Retornados dados de estoque de 8 produtos.",
    payload: JSON.stringify({
      retry_attempt: 1,
      http_status: 200,
      payload_size_kb: 4.8,
      items_received: 8
    }, null, 2)
  },
  {
    id: "log-6",
    timestamp: "2026-07-06T11:45:00Z",
    source: "Shopee",
    type: "info",
    message: "Pedido importado da Shopee.",
    details: "Importado 1 novo pedido (PED-1025) do comprador Mariana Costa Ferreira.",
    payload: JSON.stringify({
      order_id: "PED-1025",
      buyer: "Mariana Costa Ferreira",
      items: [
        { sku: "AXY-CHARG-20W", qty: 2, price: 89.9 }
      ],
      total_payment: 179.80,
      tracking_no: null
    }, null, 2)
  },
  {
    id: "log-7",
    timestamp: "2026-07-06T10:00:00Z",
    source: "Sistema",
    type: "success",
    message: "Sincronização de estoque automática executada.",
    details: "Não houveram atualizações de estoque pendentes automáticas.",
    payload: JSON.stringify({
      cron: "0 */2 * * *",
      changes_found: 0,
      action_taken: "NONE"
    }, null, 2)
  }
];

export const initialFinances: FinancialTransaction[] = [
  {
    id: "tx-1",
    date: "2026-07-01",
    type: "income",
    category: "Vendas (Receitas)",
    description: "Vendas acumuladas do canal Mercado Livre",
    amount: 15420,
    marketplace: "mercadolivre"
  },
  {
    id: "tx-2",
    date: "2026-07-02",
    type: "income",
    category: "Vendas (Receitas)",
    description: "Vendas acumuladas do canal Shopee",
    amount: 9850,
    marketplace: "shopee"
  },
  {
    id: "tx-3",
    date: "2026-07-02",
    type: "expense",
    category: "Custo de Produto (COGS)",
    description: "Reposição de estoque SSDs e fones de ouvido",
    amount: 8900,
    marketplace: "bling"
  },
  {
    id: "tx-4",
    date: "2026-07-03",
    type: "expense",
    category: "Taxas do Marketplace",
    description: "Comissão de anúncios clássicos e premium (ML)",
    amount: 2467.2,
    marketplace: "mercadolivre"
  },
  {
    id: "tx-5",
    date: "2026-07-03",
    type: "expense",
    category: "Taxas do Marketplace",
    description: "Taxa operacional de vendas Shopee v2",
    amount: 1773,
    marketplace: "shopee"
  },
  {
    id: "tx-6",
    date: "2026-07-04",
    type: "expense",
    category: "Impostos",
    description: "DAS Simples Nacional referente ao mês anterior",
    amount: 1516.2,
    marketplace: "all"
  },
  {
    id: "tx-7",
    date: "2026-07-04",
    type: "expense",
    category: "Logística e Frete",
    description: "Envios via Mercado Envios Coleta e Shopee Xpress",
    amount: 1200,
    marketplace: "all"
  },
  {
    id: "tx-8",
    date: "2026-07-05",
    type: "expense",
    category: "Marketing e Tráfego",
    description: "Campanha de Product Ads no Mercado Livre",
    amount: 850,
    marketplace: "mercadolivre"
  },
  {
    id: "tx-9",
    date: "2026-07-05",
    type: "expense",
    category: "Marketing e Tráfego",
    description: "Campanha de Shopee Ads (Busca e Descoberta)",
    amount: 450,
    marketplace: "shopee"
  },
  {
    id: "tx-10",
    date: "2026-07-05",
    type: "expense",
    category: "Assinaturas e Ferramentas",
    description: "Mensalidade do Plano Cobalto Bling ERP",
    amount: 75,
    marketplace: "bling"
  },
  {
    id: "tx-11",
    date: "2026-07-06",
    type: "expense",
    category: "Assinaturas e Ferramentas",
    description: "Ferramenta de análise de concorrência e tendências",
    amount: 120,
    marketplace: "all"
  }
];

export const initialConfig: SystemConfig = {
  bling_token: "",
  ml_client_id: "",
  ml_client_secret: "",
  ml_access_token: "",
  shopee_partner_id: "",
  shopee_partner_key: "",
  shopee_shop_id: "",
  shopee_access_token: ""
};
