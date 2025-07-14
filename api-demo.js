// Demostración de API - Simulación de integración con API REST real
// Este archivo demuestra cómo integrar con una API REST en producción

class PawmeAPI {
    constructor() {
        this.baseURL = 'https://jsonplaceholder.typicode.com'; // API de demostración
        this.apiKey = 'demo-key-12345'; // En producción usar variable de entorno
        this.cache = new Map();
        this.requestQueue = [];
        this.isOnline = navigator.onLine;

        this.setupNetworkListeners();
    }

    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processOfflineQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Método genérico para realizar peticiones HTTP
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                ...options.headers
            },
            ...options
        };

        try {
            // Verificar caché primero
            const cacheKey = `${options.method || 'GET'}_${url}`;
            if (this.cache.has(cacheKey) && (!options.method || options.method === 'GET')) {
                return this.cache.get(cacheKey);
            }

            // Si estamos offline, agregar a la cola
            if (!this.isOnline && options.method && options.method !== 'GET') {
                this.requestQueue.push({ url, config });
                throw new Error('Offline - request queued');
            }

            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Guardar en caché si es una petición GET
            if (!options.method || options.method === 'GET') {
                this.cache.set(cacheKey, data);
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    // Obtener productos desde la API
    async getProducts() {
        try {
            const data = await this.request('/posts');

            // Transformar datos de la API a nuestro formato
            return data.slice(0, 6).map((item, index) => {
                const productTemplates = [
                    { name: "GPS Smart Chip Pro", price: 89.99, features: ["Real-time GPS tracking", "Smartphone app", "Waterproof", "Battery life: 30 days"] },
                    { name: "Basic ID Chip", price: 24.99, features: ["Contact info storage", "Veterinary compatible", "Lifetime registration", "Easy scan"] },
                    { name: "Premium GPS Tracker", price: 149.99, features: ["GPS + Health monitor", "Activity tracking", "Emergency alerts", "1-year warranty"] },
                    { name: "Mini Tracker Chip", price: 59.99, features: ["Ultra-lightweight", "Small pet friendly", "Basic GPS", "15-day battery"] },
                    { name: "Smart Collar Chip", price: 79.99, features: ["LED safety lights", "Collar integration", "GPS tracking", "USB rechargeable"] },
                    { name: "Emergency Medical Chip", price: 39.99, features: ["Medical records", "Emergency contacts", "Allergy information", "Vet accessible"] }
                ];

                const template = productTemplates[index] || productTemplates[0];

                return {
                    id: item.id,
                    name: template.name,
                    price: template.price,
                    image: "./images/gps.png",
                    description: item.body.substring(0, 100) + "...",
                    features: template.features,
                    category: "tracking",
                    inStock: true,
                    apiSource: true
                };
            });
        } catch (error) {
            return this.getFallbackProducts();
        }
    }

    // Productos de respaldo si falla la API
    getFallbackProducts() {
        return [
            {
                id: 1,
                name: "GPS Smart Chip Pro",
                price: 89.99,
                image: "./images/gps.png",
                description: "Advanced GPS tracking chip with real-time location updates.",
                features: ["Real-time GPS tracking", "Smartphone app", "Waterproof", "Battery life: 30 days"],
                category: "tracking",
                inStock: true,
                apiSource: false
            },
            {
                id: 2,
                name: "Basic ID Chip",
                price: 24.99,
                image: "./images/gps.png",
                description: "Standard identification chip with owner contact information.",
                features: ["Contact info storage", "Veterinary compatible", "Lifetime registration", "Easy scan"],
                category: "identification",
                inStock: true,
                apiSource: false
            },
            {
                id: 3,
                name: "Premium GPS Tracker",
                price: 149.99,
                image: "./images/gps.png",
                description: "Premium GPS tracker with health monitoring features.",
                features: ["GPS + Health monitor", "Activity tracking", "Emergency alerts", "1-year warranty"],
                category: "tracking",
                inStock: true,
                apiSource: false
            }
        ];
    }

    // Sincronizar carrito con el servidor
    async syncCart(cartData) {
        try {
            const result = await this.request('/posts', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Pawme Cart Sync',
                    body: JSON.stringify(cartData),
                    userId: 1
                })
            });

            return result;
        } catch (error) {
            throw error;
        }
    }

    // Procesar pedido
    async processOrder(orderData) {
        try {
            const result = await this.request('/posts', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Pawme Order',
                    body: JSON.stringify(orderData),
                    userId: 1
                })
            });

            return result;
        } catch (error) {
            throw error;
        }
    }

    // Procesar cola de peticiones offline
    async processOfflineQueue() {
        const queue = [...this.requestQueue];
        this.requestQueue = [];

        for (const { url, config } of queue) {
            try {
                await fetch(url, config);
            } catch (error) {
                // Volver a agregar a la cola si sigue fallando
                this.requestQueue.push({ url, config });
            }
        }
    }

    // Obtener estadísticas de la API
    getAPIStats() {
        return {
            cacheSize: this.cache.size,
            queueSize: this.requestQueue.length,
            isOnline: this.isOnline,
            baseURL: this.baseURL
        };
    }
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PawmeAPI;
}

// Hacer disponible globalmente en el navegador
window.PawmeAPI = PawmeAPI;
