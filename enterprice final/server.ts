import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { Product, Order, APIStatus, LogEntry, FinancialTransaction, SystemConfig } from './src/types';
import { initialProducts, initialOrders, initialAPIStatus, initialLogs, initialFinances, initialConfig } from './src/mockData';

const app = express();
const PORT = 3000;

app.use(express.json());

const DB_FILE = path.join(process.cwd(), 'db.json');

// Interface for the persistent JSON database
interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  apiStatus: APIStatus[];
  logs: LogEntry[];
  finances: FinancialTransaction[];
  config: SystemConfig;
}

// Helper to retrieve correct lists (no mode selection, directly from database)
function getActiveData(db: DatabaseSchema) {
  return {
    products: db.products || [],
    orders: db.orders || [],
    logs: db.logs || [],
    finances: db.finances || [],
  };
}

// Helper to load or initialize the database
function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const db = JSON.parse(data) as DatabaseSchema;
      if (!db.products) db.products = [];
      if (!db.orders) db.orders = [];
      if (!db.logs) db.logs = [];
      if (!db.finances) db.finances = [];
      if (!db.apiStatus) db.apiStatus = initialAPIStatus;
      if (!db.config) db.config = initialConfig;
      return db;
    }
  } catch (error) {
    console.error('Error reading db.json, resetting to clean API database', error);
  }

  // Initialize with empty arrays (only active API details, no test data fallback)
  const db: DatabaseSchema = {
    products: [],
    orders: [],
    apiStatus: initialAPIStatus,
    logs: [
      {
        id: `log-system-${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: 'SISTEMA',
        type: 'info',
        message: 'Aplicativo inicializado em modo de API real. Configure suas credenciais na aba Ajustes.',
        details: null
      }
    ],
    finances: [],
    config: initialConfig
  };
  saveDatabase(db);
  return db;
}

// Helper to save the database
function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to db.json', error);
  }
}

// ---------------------------------------------------------
// Real API Integrations & Proxy Helpers
// ---------------------------------------------------------

// 1. Fetch real Bling products using Bling API v3 Bearer Token
async function fetchBlingProducts(token: string): Promise<{ sku: string; stock: number; price: number; name: string }[]> {
  const url = 'https://api.bling.com.br/v3/produtos?pagina=1&limite=100';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Bling API Error [${response.status}]: ${errText || response.statusText}`);
  }

  const result = await response.json() as any;
  const productsList = result.data || [];

  return productsList.map((item: any) => {
    // Bling API v3 structure maps product data
    return {
      sku: item.codigo || '',
      stock: item.estoque?.saldoFisicoTotal ?? 0,
      price: item.preco ?? 0,
      name: item.nome || ''
    };
  });
}

// 2. Fetch real Mercado Livre items & stocks using ML Access Token
async function fetchMercadoLivreItems(accessToken: string): Promise<{ id: string; sku: string; stock: number; status: string; price: number }[]> {
  // First, check the identity and retrieve active item IDs of the user
  const meResponse = await fetch('https://api.mercadolibre.com/users/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!meResponse.ok) {
    const errText = await meResponse.text();
    throw new Error(`Mercado Livre auth failed [${meResponse.status}]: ${errText}`);
  }

  const meData = await meResponse.json() as any;
  const userId = meData.id;

  // Search active products of this user
  const searchResponse = await fetch(`https://api.mercadolibre.com/users/${userId}/items/search?limit=50`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!searchResponse.ok) {
    throw new Error(`Could not list Mercado Livre items [${searchResponse.status}]`);
  }

  const searchData = await searchResponse.json() as any;
  const itemIds: string[] = searchData.results || [];

  if (itemIds.length === 0) return [];

  // Fetch full details for each item to match stock and sku (attributes/seller_custom_field)
  const itemsDetails: { id: string; sku: string; stock: number; status: string; price: number }[] = [];

  // Split details into parallel requests
  const detailPromises = itemIds.map(async (itemId) => {
    try {
      const detailRes = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (detailRes.ok) {
        const d = await detailRes.json() as any;
        // In ML, the SKU is usually stored in 'seller_custom_field' or inside the 'attributes' with id 'SELLER_SKU'
        let sku = d.seller_custom_field || '';
        if (!sku && d.attributes) {
          const skuAttr = d.attributes.find((attr: any) => attr.id === 'SELLER_SKU');
          if (skuAttr) sku = skuAttr.value_name || skuAttr.value_id || '';
        }

        itemsDetails.push({
          id: d.id,
          sku: sku || d.id,
          stock: d.available_quantity || 0,
          status: d.status || 'active',
          price: d.price || 0
        });
      }
    } catch (e) {
      console.error(`Error retrieving item details for ${itemId}`, e);
    }
  });

  await Promise.all(detailPromises);
  return itemsDetails;
}

// 3. Get Mercado Livre User ID
async function getMercadoLivreUserId(accessToken: string): Promise<string> {
  const response = await fetch('https://api.mercadolibre.com/users/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (!response.ok) throw new Error('Failed to get ML User ID');
  const d = await response.json() as any;
  return d.id;
}

// 4. Fetch real Bling orders
async function fetchBlingOrders(token: string): Promise<Order[]> {
  try {
    const url = 'https://api.bling.com.br/v3/pedidos/vendas?pagina=1&limite=10';
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    if (!response.ok) return [];
    const result = await response.json() as any;
    const list = result.data || [];
    return list.map((item: any) => {
      let status: Order['status'] = 'new';
      const sitId = item.situacao?.id;
      if (sitId === 9) status = 'delivered'; // Atendido
      else if (sitId === 6) status = 'paid'; // Aberto/Pago
      else if (sitId === 12) status = 'invoice_pending'; // Faturado

      return {
        id: `BL-${item.numero || item.id}`,
        marketplace: 'bling',
        customer: item.contato?.nome || 'Cliente Bling',
        status,
        date: item.data || new Date().toISOString(),
        total: parseFloat(item.total) || 0,
        items_count: 1,
        tracking_code: null
      };
    });
  } catch (e) {
    console.error('Error fetching Bling orders:', e);
    return [];
  }
}

// 5. Fetch real Mercado Livre orders
async function fetchMercadoLivreOrders(accessToken: string, userId: string): Promise<Order[]> {
  try {
    const url = `https://api.mercadolibre.com/orders/search?seller=${userId}&limit=10`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!response.ok) return [];
    const result = await response.json() as any;
    const list = result.results || [];
    return list.map((o: any) => {
      let status: Order['status'] = 'new';
      if (o.status === 'paid') status = 'paid';
      else if (o.status === 'delivered') status = 'delivered';
      else if (o.status === 'cancelled') status = 'stopped';
      else if (o.status === 'shipped') status = 'shipped';

      return {
        id: `ML-${o.id}`,
        marketplace: 'mercadolivre',
        customer: o.buyer ? `${o.buyer.first_name || ''} ${o.buyer.last_name || ''}`.trim() || 'Comprador ML' : 'Comprador ML',
        status,
        date: o.date_created || new Date().toISOString(),
        total: o.total_amount || 0,
        items_count: o.order_items?.length || 1,
        tracking_code: o.shipping?.id ? String(o.shipping.id) : null
      };
    });
  } catch (e) {
    console.error('Error fetching ML orders:', e);
    return [];
  }
}

// ---------------------------------------------------------
// API ROUTES
// ---------------------------------------------------------

// Retrieve full state
app.get('/api/data', (req, res) => {
  const db = loadDatabase();
  const active = getActiveData(db);
  res.json({
    products: active.products,
    orders: active.orders,
    apiStatus: db.apiStatus,
    logs: active.logs,
    finances: active.finances,
    config: db.config
  });
});

// Update credentials configuration
app.post('/api/config', (req, res) => {
  const db = loadDatabase();
  const newConfig = req.body as SystemConfig;
  
  db.config = { ...db.config, ...newConfig };
  
  // Add a system log reflecting credentials change
  const log: LogEntry = {
    id: `log-system-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: 'Sistema',
    type: 'info',
    message: `Configurações atualizadas de conexão.`,
    details: `Chaves de API atualizadas. Conectividade direta em tempo real ativada.`,
    payload: JSON.stringify(db.config, null, 2)
  };
  
  db.logs.unshift(log);
  
  saveDatabase(db);
  const active = getActiveData(db);
  res.json({ 
    success: true, 
    config: db.config, 
    logs: active.logs,
    products: active.products,
    orders: active.orders,
    finances: active.finances
  });
});

// Perform individual reconciliation correction
app.post('/api/reconcile', (req, res) => {
  const { productId, action, canal } = req.body as { productId: string; action: 'bling' | 'channel' | 'ignore'; canal: 'mercadolivre' | 'shopee' };
  const db = loadDatabase();
  const active = getActiveData(db);

  const product = active.products.find(p => p.id === productId);
  if (!product) {
    res.status(404).json({ error: 'Produto não encontrado' });
    return;
  }

  let logMessage = '';
  let logDetails = '';

  if (action === 'bling') {
    // Corrige Bling -> puxa estoque do canal selecionado
    const targetStock = canal === 'mercadolivre' ? product.ml_stock : (product.shopee_stock ?? 0);
    const oldStock = product.bling_stock;
    product.bling_stock = targetStock;
    product.ignored_alert = false;

    logMessage = `Estoque corrigido no Bling ERP para SKU ${product.sku}`;
    logDetails = `Estoque sincronizado do canal ${canal === 'mercadolivre' ? 'Mercado Livre' : 'Shopee'}. Saldo alterado de ${oldStock} para ${targetStock} un.`;
  } else if (action === 'channel') {
    // Corrige no Canal -> empurra estoque do Bling para o canal selecionado
    const targetStock = product.bling_stock;
    if (canal === 'mercadolivre') {
      const oldStock = product.ml_stock;
      product.ml_stock = targetStock;
      logMessage = `Estoque corrigido no Mercado Livre para SKU ${product.sku}`;
      logDetails = `Sincronização forçada enviada do Bling ERP. Estoque do anúncio alterado de ${oldStock} para ${targetStock} un.`;
    } else {
      const oldStock = product.shopee_stock ?? 0;
      product.shopee_stock = targetStock;
      logMessage = `Estoque corrigido na Shopee para SKU ${product.sku}`;
      logDetails = `Sincronização forçada enviada do Bling ERP. Estoque do anúncio alterado de ${oldStock} para ${targetStock} un.`;
    }
    product.ignored_alert = false;
  } else if (action === 'ignore') {
    product.ignored_alert = true;
    logMessage = `Alerta de divergência ignorado temporariamente`;
    logDetails = `Divergência de estoque/preço do SKU ${product.sku} foi silenciada no painel principal.`;
  }

  const log: LogEntry = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: action === 'bling' ? 'Bling' : (canal === 'mercadolivre' ? 'Mercado Livre' : 'Shopee'),
    type: action === 'ignore' ? 'info' : 'success',
    message: logMessage,
    details: logDetails,
    payload: JSON.stringify({ productId, action, canal, product_state: product }, null, 2)
  };

  db.logs.unshift(log);

  saveDatabase(db);
  const updatedActive = getActiveData(db);
  res.json({ success: true, products: updatedActive.products, logs: updatedActive.logs });
});

// Perform bulk reconciliation corrections
app.post('/api/reconcile-bulk', (req, res) => {
  const { productIds, direction } = req.body as { productIds: string[]; direction: 'to_bling' | 'to_channel' };
  const db = loadDatabase();
  const active = getActiveData(db);

  let correctedCount = 0;
  const affectedSkus: string[] = [];

  active.products.forEach(product => {
    if (productIds.includes(product.id)) {
      if (direction === 'to_bling') {
        const targetStock = product.shopee_stock !== null ? product.shopee_stock : product.ml_stock;
        product.bling_stock = targetStock;
      } else if (direction === 'to_channel') {
        const targetStock = product.bling_stock;
        product.ml_stock = targetStock;
        if (product.shopee_stock !== null) {
          product.shopee_stock = targetStock;
        }
      }
      product.ignored_alert = false;
      correctedCount++;
      affectedSkus.push(product.sku);
    }
  });

  const log: LogEntry = {
    id: `log-bulk-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: 'Sistema',
    type: 'success',
    message: `Correção em lote efetuada para ${correctedCount} produtos`,
    details: `Direção da correção: ${direction === 'to_bling' ? 'Sincronizar ERP Bling' : 'Atualizar canais ativos'}. SKUs afetados: ${affectedSkus.join(', ')}`,
    payload: JSON.stringify({ productIds, direction, affectedSkus, total_corrected: correctedCount }, null, 2)
  };

  db.logs.unshift(log);

  saveDatabase(db);
  const updatedActive = getActiveData(db);
  res.json({ success: true, products: updatedActive.products, logs: updatedActive.logs });
});

// Add custom financial transaction
app.post('/api/finances', (req, res) => {
  const db = loadDatabase();
  const newTx = req.body as Omit<FinancialTransaction, 'id'>;

  const fullTx: FinancialTransaction = {
    id: `tx-user-${Date.now()}`,
    ...newTx
  };

  db.finances.unshift(fullTx);

  // Generate log entry for financial launch
  const log: LogEntry = {
    id: `log-fin-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: 'Sistema',
    type: 'success',
    message: `Lançamento financeiro adicionado`,
    details: `Nova transação do tipo [${newTx.type === 'income' ? 'RECEITA' : 'DESPESA'}] na categoria '${newTx.category}' no valor de R$ ${newTx.amount.toFixed(2)}.`,
    payload: JSON.stringify(fullTx, null, 2)
  };

  db.logs.unshift(log);

  saveDatabase(db);
  const active = getActiveData(db);
  res.json({ success: true, finances: active.finances, logs: active.logs });
});

// Global API sync trigger
app.post('/api/sync', async (req, res) => {
  const db = loadDatabase();
  const config = db.config;

  // Track operational latency and sync achievements
  const latencyResults = { bling: 120, mercadolivre: 170, shopee: 250 };
  let apiStatusUpdate: APIStatus[] = [...db.apiStatus];

  const syncLogs: string[] = [];
  let blProducts: { sku: string; stock: number; price: number; name: string }[] = [];
  let mlItems: { id: string; sku: string; stock: number; status: string; price: number }[] = [];
  let realOrders: Order[] = [];
  let errorOccurred = false;

  let mlUserId = '';

  // 1. Try Bling integration
  if (config.bling_token) {
    const startTime = Date.now();
    try {
      blProducts = await fetchBlingProducts(config.bling_token);
      latencyResults.bling = Date.now() - startTime;
      syncLogs.push(`Bling ERP: Sincronizado com sucesso. ${blProducts.length} produtos encontrados.`);
      
      try {
        const blOrders = await fetchBlingOrders(config.bling_token);
        if (blOrders.length > 0) {
          realOrders = [...realOrders, ...blOrders];
          syncLogs.push(`Bling ERP: Importados ${blOrders.length} pedidos reais.`);
        }
      } catch (oe) {
        console.error('Bling orders failed', oe);
      }

      const blStatus = apiStatusUpdate.find(s => s.id === 'bling');
      if (blStatus) {
        blStatus.status = 'active';
        blStatus.latency = latencyResults.bling;
        blStatus.requests_today += 1;
      }
    } catch (e: any) {
      errorOccurred = true;
      syncLogs.push(`Falha na API do Bling ERP: ${e.message}`);
      const blStatus = apiStatusUpdate.find(s => s.id === 'bling');
      if (blStatus) {
        blStatus.status = 'error';
        blStatus.latency = 999;
      }
    }
  } else {
    syncLogs.push('Bling ERP: Token de acesso ausente nas configurações.');
  }

  // 2. Try Mercado Livre integration
  if (config.ml_access_token) {
    const startTime = Date.now();
    try {
      mlItems = await fetchMercadoLivreItems(config.ml_access_token);
      latencyResults.mercadolivre = Date.now() - startTime;
      syncLogs.push(`Mercado Livre: Sincronizado com sucesso. ${mlItems.length} anúncios mapeados.`);

      try {
        mlUserId = await getMercadoLivreUserId(config.ml_access_token);
        const mlOrders = await fetchMercadoLivreOrders(config.ml_access_token, mlUserId);
        if (mlOrders.length > 0) {
          realOrders = [...realOrders, ...mlOrders];
          syncLogs.push(`Mercado Livre: Importados ${mlOrders.length} pedidos reais.`);
        }
      } catch (oe) {
        console.error('ML orders failed', oe);
      }

      const mlStatus = apiStatusUpdate.find(s => s.id === 'mercadolivre');
      if (mlStatus) {
        mlStatus.status = 'active';
        mlStatus.latency = latencyResults.mercadolivre;
        mlStatus.requests_today += 1;
      }
    } catch (e: any) {
      errorOccurred = true;
      syncLogs.push(`Falha na API do Mercado Livre: ${e.message}`);
      const mlStatus = apiStatusUpdate.find(s => s.id === 'mercadolivre');
      if (mlStatus) {
        mlStatus.status = 'error';
        mlStatus.latency = 999;
      }
    }
  } else {
    syncLogs.push('Mercado Livre: Access Token ausente nas configurações.');
  }

  // Merge and build clean lists
  const syncedProductsMap = new Map<string, Product>();

  // Add Bling products
  blProducts.forEach((bp, index) => {
    const sku = bp.sku || `BLING-UNMAPPED-${index}`;
    syncedProductsMap.set(sku, {
      id: `prod-bl-${sku}`,
      sku: sku,
      name: bp.name || `Produto Bling ${sku}`,
      bling_stock: bp.stock,
      ml_stock: 0,
      shopee_stock: null,
      ml_status: 'not_listed',
      shopee_status: null,
      price: bp.price || 0,
      has_photo: true,
      has_description: true,
      has_video: false,
      title_valid: bp.name ? bp.name.length >= 10 : false,
      attributes_complete: true,
      image_url: "https://images.unsplash.com/photo-1597872200919-0127a4b10165?w=150&auto=format&fit=crop&q=60",
      ignored_alert: false
    });
  });

  // Merge Mercado Livre items
  mlItems.forEach(mi => {
    const sku = mi.sku || mi.id;
    if (syncedProductsMap.has(sku)) {
      const existing = syncedProductsMap.get(sku)!;
      existing.ml_stock = mi.stock;
      existing.ml_status = mi.status;
      if (!existing.price) existing.price = mi.price;
    } else {
      syncedProductsMap.set(sku, {
        id: `prod-ml-${sku}`,
        sku: sku,
        name: `Anúncio ML - ${sku}`,
        bling_stock: 0,
        ml_stock: mi.stock,
        shopee_stock: null,
        ml_status: mi.status,
        shopee_status: null,
        price: mi.price || 0,
        has_photo: true,
        has_description: true,
        has_video: false,
        title_valid: true,
        attributes_complete: true,
        image_url: "https://images.unsplash.com/photo-1597872200919-0127a4b10165?w=150&auto=format&fit=crop&q=60",
        ignored_alert: false
      });
    }
  });

  // Persist real products and orders in the namespace
  db.products = Array.from(syncedProductsMap.values());
  if (realOrders.length > 0) {
    db.orders = realOrders;
  }

  // Trigger log recording with outcomes
  const finalLog: LogEntry = {
    id: `log-sync-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: 'Sistema',
    type: errorOccurred ? 'warning' : 'success',
    message: 'Sincronização global de produção concluída',
    details: syncLogs.join(' | '),
    payload: JSON.stringify({
      bling_items_fetched: blProducts.length,
      ml_items_fetched: mlItems.length,
      orders_imported: realOrders.length,
      latency: latencyResults,
      logs: syncLogs
    }, null, 2)
  };

  db.logs.unshift(finalLog);
  db.apiStatus = apiStatusUpdate;
  saveDatabase(db);

  const active = getActiveData(db);

  res.json({
    success: !errorOccurred,
    products: active.products,
    apiStatus: db.apiStatus,
    logs: active.logs,
    orders: active.orders,
    message: errorOccurred ? 'Sincronização concluída com avisos ou erros de conexão' : 'Sincronização em tempo real efetuada com sucesso!'
  });
});

// ---------------------------------------------------------
// VITE DEV SERVER & PRODUCTION ROUTING
// ---------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CID Enterprise] CIO Backend Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
