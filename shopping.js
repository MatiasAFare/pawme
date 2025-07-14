// Configuración de la API
const API_CONFIG = {
    // Usando JSONPlaceholder como API simulada para demostración
    // En producción, reemplazar con el endpoint real de la API
    baseURL: 'https://jsonplaceholder.typicode.com',
    endpoints: {
        products: '/posts' // Usando posts como productos simulados
    }
};

// Datos de productos de respaldo (en caso de que falle la API)
const fallbackProducts = [
    {
        id: 1,
        name: "GPS Smart Chip Pro",
        price: 89.99,
        image: "./images/gps.png",
        description: "Advanced GPS tracking chip with real-time location updates and smartphone app integration.",
        features: ["Real-time GPS tracking", "Smartphone app", "Waterproof", "Battery life: 30 days"]
    },
    {
        id: 2,
        name: "Basic ID Chip",
        price: 24.99,
        image: "./images/gps.png",
        description: "Standard identification chip with owner contact information storage.",
        features: ["Contact info storage", "Veterinary compatible", "Lifetime registration", "Easy scan"]
    },
    {
        id: 3,
        name: "Premium GPS Tracker",
        price: 149.99,
        image: "./images/gps.png",
        description: "Premium GPS tracker with health monitoring and activity tracking features.",
        features: ["GPS + Health monitor", "Activity tracking", "Emergency alerts", "1-year warranty"]
    },
    {
        id: 4,
        name: "Mini Tracker Chip",
        price: 59.99,
        image: "./images/gps.png",
        description: "Compact tracking chip perfect for small pets and cats.",
        features: ["Ultra-lightweight", "Small pet friendly", "Basic GPS", "15-day battery"]
    },
    {
        id: 5,
        name: "Smart Collar Chip",
        price: 79.99,
        image: "./images/gps.png",
        description: "Collar-integrated smart chip with LED lighting and GPS tracking.",
        features: ["LED safety lights", "Collar integration", "GPS tracking", "USB rechargeable"]
    },
    {
        id: 6,
        name: "Emergency Medical Chip",
        price: 39.99,
        image: "./images/gps.png",
        description: "Medical information chip storing pet's health records and emergency contacts.",
        features: ["Medical records", "Emergency contacts", "Allergy information", "Vet accessible"]
    }
];

// Variables globales
let products = [];
let cart = JSON.parse(localStorage.getItem('pawme-cart')) || [];
let productsGrid;
let cartCount;
let cartItems;
let cartSidebar;
let totalAmount;

// Configuración e integración de la API
let api; // Se inicializará cuando PawmeAPI esté disponible

// Funciones mejoradas de la API
async function fetchProducts() {
    try {
        showLoadingState();

        // Inicializar API si está disponible
        if (window.PawmeAPI && !api) {
            api = new window.PawmeAPI();
        }

        if (api) {
            // Usar la clase API dedicada
            products = await api.getProducts();
        } else {
            // Método alternativo con fetch directo
            const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.products}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const apiData = await response.json();

            // Transformar datos de la API a nuestro formato de producto
            products = apiData.slice(0, 6).map((item, index) => ({
                id: item.id,
                name: `${fallbackProducts[index]?.name || `Chip Product ${item.id}`}`,
                price: fallbackProducts[index]?.price || (29.99 + (index * 20)),
                image: fallbackProducts[index]?.image || "./images/gps.png",
                description: item.body.substring(0, 100) + "..." || fallbackProducts[index]?.description,
                features: fallbackProducts[index]?.features || ["Feature 1", "Feature 2", "Feature 3"]
            }));
        }

    } catch (error) {
        products = fallbackProducts;
    } finally {
        hideLoadingState();
        renderProducts();

        // Mostrar estado de la API
        displayAPIStatus();
    }
}

function displayAPIStatus() {
    const statusContainer = document.createElement('div');
    statusContainer.id = 'api-status';
    statusContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 999;
        max-width: 200px;
    `;

    const isAPIWorking = products.some(p => p.apiSource !== false);
    const statusText = isAPIWorking ? '🟢 API Connected' : '🟡 Using Offline Data';

    statusContainer.innerHTML = `
        <div>${statusText}</div>
        ${api ? `<div>Cache: ${api.getAPIStats().cacheSize} items</div>` : ''}
        <div>Products: ${products.length}</div>
    `;

    // Eliminar estado existente
    const existing = document.getElementById('api-status');
    if (existing) existing.remove();

    document.body.appendChild(statusContainer);

    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
        statusContainer.style.opacity = '0';
        setTimeout(() => statusContainer.remove(), 1000);
    }, 5000);
}

function showLoadingState() {
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div class="loading-container" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <div class="loading-spinner" style="display: inline-block; width: 40px; height: 40px; border: 4px solid #444; border-top: 4px solid #329330; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="color: #dbdbdb; margin-top: 20px; font-size: 1.2rem;">Loading products...</p>
            </div>
        `;
    }
}

function hideLoadingState() {
    const loadingContainer = document.querySelector('.loading-container');
    if (loadingContainer) {
        loadingContainer.remove();
    }
}

// Agregar CSS para el spinner de carga
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function () {
    productsGrid = document.getElementById('products-grid');
    cartCount = document.getElementById('cart-count');
    cartItems = document.getElementById('cart-items');
    cartSidebar = document.getElementById('cart-sidebar');
    totalAmount = document.getElementById('total-amount');

    // Cargar productos desde la API
    fetchProducts();
    updateCartUI();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('cart-toggle').addEventListener('click', toggleCart);
    document.getElementById('close-cart').addEventListener('click', closeCart);
    document.getElementById('clear-cart').addEventListener('click', clearCart);
    document.getElementById('checkout-btn').addEventListener('click', checkout);

    // Funcionalidad de búsqueda
    const searchInput = document.getElementById('product-search');
    const clearSearchBtn = document.getElementById('clear-search');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchProducts(e.target.value);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchProducts(e.target.value);
            }
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                renderProducts();
            }
        });
    }
}

function renderProducts() {
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <ul class="product-features">
                    ${product.features.map(feature => `<li>✓ ${feature}</li>`).join('')}
                </ul>
                <div class="product-footer">
                    <span class="product-price">$${product.price}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI(true);
    showAddedToCartMessage(product.name);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    const item = cart.find(item => item.id === productId);
    if (item) {
        const oldQuantity = item.quantity;
        item.quantity = newQuantity;
        saveCart();
        updateCartUI(newQuantity > oldQuantity);
    }
}

function saveCart() {
    localStorage.setItem('pawme-cart', JSON.stringify(cart));
}

function updateCartUI(animate = false) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (totalItems === 0) {
        cartCount.classList.add('empty');
    } else {
        cartCount.classList.remove('empty');
        if (animate) {
            cartCount.classList.add('pulse');
            setTimeout(() => cartCount.classList.remove('pulse'), 300);
        }
    }

    cartItems.innerHTML = cart.length === 0 ?
        '<p class="empty-cart">Your cart is empty</p>' :
        cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price}</p>
                    <div class="quantity-controls">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">✕</button>
            </div>
        `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmount.textContent = total.toFixed(2);
}

function toggleCart() {
    cartSidebar.classList.toggle('cart-hidden');
}

function closeCart() {
    cartSidebar.classList.add('cart-hidden');
}

function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        updateCartUI();
    }
}

function showAddedToCartMessage(productName) {
    const message = document.createElement('div');
    message.className = 'cart-message';
    message.textContent = `${productName} added to cart!`;
    document.body.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Funcionalidad mejorada de la API y persistencia de datos
async function syncCartWithServer() {
    try {
        const cartData = {
            items: cart,
            timestamp: new Date().toISOString(),
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            sessionId: localStorage.getItem('pawme-session-id') || generateSessionId()
        };

        if (api) {
            // Use the dedicated API class
            await api.syncCart(cartData);
        } else {
            // Fallback to direct API call
            const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: 'Pawme Cart Sync',
                    body: JSON.stringify(cartData),
                    userId: 1
                })
            });
        }

        return true;
    } catch (error) {
        return false;
    }
}

function generateSessionId() {
    const sessionId = 'pawme_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('pawme-session-id', sessionId);
    return sessionId;
}

// Proceso de checkout mejorado con integración de API
async function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsList = cart.map(item => `${item.name} x${item.quantity}`).join(', ');

    if (confirm(`Proceed to checkout?\n\nItems: ${itemsList}\nTotal: $${total.toFixed(2)}`)) {
        try {
            // Prepare order data
            const orderData = {
                items: cart,
                total: total,
                timestamp: new Date().toISOString(),
                orderId: 'ORDER_' + Date.now(),
                sessionId: localStorage.getItem('pawme-session-id')
            };

            // Process order via API
            if (api) {
                await api.processOrder(orderData);
            }

            // Show success message
            showOrderConfirmation(orderData);

            // Clear cart
            cart = [];
            saveCart();
            updateCartUI();
            closeCart();

        } catch (error) {
            alert('There was an error processing your order. Please try again.');
        }
    }
}

function showOrderConfirmation(orderData) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;

    modal.innerHTML = `
        <div style="background: #1a1a1a; padding: 30px; border-radius: 10px; text-align: center; max-width: 400px; border: 2px solid #329330;">
            <h2 style="color: #329330; margin-bottom: 20px;">✅ Order Confirmed!</h2>
            <p style="color: white; margin-bottom: 10px;">Order ID: ${orderData.orderId}</p>
            <p style="color: white; margin-bottom: 10px;">Total: $${orderData.total.toFixed(2)}</p>
            <p style="color: #ccc; margin-bottom: 20px;">Your pet chips will be shipped within 3-5 business days.</p>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: #329330; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    // Auto-close after 10 seconds
    setTimeout(() => {
        if (modal.parentElement) {
            modal.remove();
        }
    }, 10000);
}

// Funcionalidad mejorada de búsqueda de productos
function searchProducts(query) {
    if (!query.trim()) {
        renderProducts();
        return;
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.features.some(feature => feature.toLowerCase().includes(query.toLowerCase()))
    );

    renderFilteredProducts(filteredProducts);
}

function renderFilteredProducts(filteredProducts) {
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p style="color: #dbdbdb; font-size: 1.2rem;">No products found matching your search.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <ul class="product-features">
                    ${product.features.map(feature => `<li>✓ ${feature}</li>`).join('')}
                </ul>
                <div class="product-footer">
                    <span class="product-price">$${product.price}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Estado de la API y Panel de Debug
function createAPIDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'api-debug-panel';
    panel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-size: 11px;
        z-index: 999;
        max-width: 250px;
        border: 1px solid #444;
        display: none;
    `;

    updateAPIDebugPanel(panel);
    document.body.appendChild(panel);

    // Alternar panel con atajo de teclado (Ctrl + Shift + D)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            if (panel.style.display === 'block') {
                updateAPIDebugPanel(panel);
            }
        }
    });

    return panel;
}

function updateAPIDebugPanel(panel) {
    const stats = api ? api.getAPIStats() : { cacheSize: 0, queueSize: 0, isOnline: navigator.onLine, baseURL: 'N/A' };
    const cartSize = cart.length;
    const cartValue = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    panel.innerHTML = `
        <h4 style="margin: 0 0 10px 0; color: #329330;">🔧 Debug Panel</h4>
        <div><strong>API Status:</strong> ${stats.isOnline ? '🟢 Online' : '🔴 Offline'}</div>
        <div><strong>Base URL:</strong> ${stats.baseURL}</div>
        <div><strong>Cache Size:</strong> ${stats.cacheSize} items</div>
        <div><strong>Queue Size:</strong> ${stats.queueSize} requests</div>
        <div><strong>Products:</strong> ${products.length} loaded</div>
        <div><strong>Cart Items:</strong> ${cartSize}</div>
        <div><strong>Cart Value:</strong> $${cartValue.toFixed(2)}</div>
        <div><strong>Storage:</strong> ${localStorage.getItem('pawme-cart') ? 'Available' : 'Empty'}</div>
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #444;">
            <small>Press Ctrl+Shift+D to toggle</small>
        </div>
    `;
}

// Inicializar panel de debug al cargar la página
if (window.location.href.includes('shopping.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(createAPIDebugPanel, 1000);
    });
}

// Respaldo periódico del carrito
setInterval(() => {
    if (cart.length > 0) {
        syncCartWithServer();
    }
}, 30000); // Sincronizar cada 30 segundos

// Manejo de conexión online/offline
window.addEventListener('online', () => {
    if (cart.length > 0) {
        syncCartWithServer();
    }
});

window.addEventListener('offline', () => {
    // Trabajando offline - los datos se sincronizarán cuando se restaure la conexión
});
