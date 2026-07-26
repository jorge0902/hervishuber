// HervisHuber MapLibre GL JS & App Logic

const drivers = [
  {
    id: 1,
    name: "Ahmed",
    lat: 25.2048,
    lng: 55.2708,
    vehicle: "Toyota Camry",
    rating: 4.9,
    eta: "3 min",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Carlos",
    lat: 25.2101,
    lng: 55.2784,
    vehicle: "Tesla Model Y",
    rating: 5.0,
    eta: "5 min",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Mohamed",
    lat: 25.1995,
    lng: 55.2660,
    vehicle: "Lexus ES",
    rating: 4.8,
    eta: "4 min",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop"
  }
];

let map = null;
let selectedDriver = drivers[0];
const driverMarkers = [];

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    setupTripForm();
});

function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof maplibregl === 'undefined') return;

    // Initialize MapLibre GL with Carto Positron vector style (clean, minimal OSM)
    map = new maplibregl.Map({
        container: 'map',
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [55.2708, 25.2048], // Dubai [lng, lat]
        zoom: 13,
        attributionControl: false
    });

    // Add navigation controls (zoom in/out, pitch)
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

    // Detect user geolocation
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLng = position.coords.longitude;
                const userLat = position.coords.latitude;

                // Center map on user
                map.flyTo({ center: [userLng, userLat], zoom: 14 });

                // Create blue user marker
                const userEl = document.createElement('div');
                userEl.className = 'w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-md animate-pulse';
                
                new maplibregl.Marker({ element: userEl })
                    .setLngLat([userLng, userLat])
                    .setPopup(new maplibregl.Popup({ offset: 15 }).setHTML('<div class="p-2 text-xs font-bold text-gray-800">Tu ubicación actual</div>'))
                    .addTo(map);
            },
            () => {
                console.log('Geolocalización denegada o no disponible. Usando ubicación por defecto (Dubái).');
            }
        );
    }

    // Add drivers to map
    drivers.forEach(driver => {
        const el = document.createElement('div');
        el.className = 'w-10 h-10 bg-brand-black text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform';
        el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 1 12.7V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>';

        const popupContent = `
            <div class="p-3 text-brand-black max-w-[200px]">
                <div class="flex items-center gap-3 mb-2">
                    <img src="${driver.photo}" class="w-10 h-10 rounded-full object-cover border border-gray-200" alt="${driver.name}"/>
                    <div>
                        <div class="font-bold text-sm text-gray-900">${driver.name}</div>
                        <div class="text-xs text-gray-500">${driver.vehicle}</div>
                    </div>
                </div>
                <div class="flex items-center justify-between text-xs mb-3 bg-gray-50 p-2 rounded-lg">
                    <span class="font-semibold text-yellow-600">★ ${driver.rating}</span>
                    <span class="font-medium text-gray-600">ETA: ${driver.eta}</span>
                </div>
                <button onclick="selectDriver(${driver.id})" class="w-full bg-brand-black text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors">
                    Seleccionar conductor
                </button>
            </div>
        `;

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);

        const marker = new maplibregl.Marker({ element: el })
            .setLngLat([driver.lng, driver.lat])
            .setPopup(popup)
            .addTo(map);

        driverMarkers.push({ id: driver.id, marker: marker, data: driver });
    });

    // Start movement simulation loop
    startDriverSimulation();
}

function selectDriver(driverId) {
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
        selectedDriver = driver;
        const driverInfoEl = document.getElementById('selected-driver-info');
        if (driverInfoEl) {
            driverInfoEl.innerText = `${driver.name} • ${driver.vehicle} (${driver.eta})`;
        }
        showNotification(`Conductor seleccionado: ${driver.name} (${driver.vehicle})`);
    }
}

function startDriverSimulation() {
    setInterval(() => {
        driverMarkers.forEach(item => {
            // Slight random movement [-0.0002, 0.0002]
            const deltaLat = (Math.random() - 0.5) * 0.0004;
            const deltaLng = (Math.random() - 0.5) * 0.0004;

            item.data.lat += deltaLat;
            item.data.lng += deltaLng;

            item.marker.setLngLat([item.data.lng, item.data.lat]);
        });
    }, 3000);
}

function setupTripForm() {
    const form = document.getElementById('trip-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const pickup = document.getElementById('pickup-input')?.value || "Aeropuerto de Dubái";
        const dropoff = document.getElementById('dropoff-input')?.value || "Dubai Marina";
        const price = document.getElementById('est-price')?.innerText || "AED 120";
        const time = document.getElementById('est-time')?.innerText || "~25 min";
        const distance = "14.2 km";

        const tripData = {
            id: 'TRIP-' + Math.floor(100000 + Math.random() * 900000),
            pickup,
            dropoff,
            price,
            time,
            distance,
            driver: selectedDriver,
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        const existingTrips = JSON.parse(localStorage.getItem('hervishuber_trips') || '[]');
        existingTrips.unshift(tripData);
        localStorage.setItem('hervishuber_trips', JSON.stringify(existingTrips));

        // Show confirmation modal
        showConfirmationModal(tripData);
    });
}

function showConfirmationModal(trip) {
    const modal = document.getElementById('confirm-modal');
    const details = document.getElementById('modal-trip-details');
    if (!modal || !details) {
        alert(`¡Viaje Solicitado con éxito!\n\nCódigo: ${trip.id}\nRecogida: ${trip.pickup}\nDestino: ${trip.dropoff}\nConductor: ${trip.driver.name} (${trip.driver.vehicle})\nPrecio: ${trip.price}`);
        return;
    }

    details.innerHTML = `
        <div class="space-y-3 text-left my-4">
            <div class="flex justify-between items-center pb-2 border-b border-gray-100">
                <span class="text-xs font-semibold text-gray-400 uppercase">Código de reserva</span>
                <span class="font-mono text-xs font-bold text-brand-black">${trip.id}</span>
            </div>
            <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full bg-brand-black"></div>
                <div class="text-sm font-medium text-brand-black">${trip.pickup}</div>
            </div>
            <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-sm bg-brand-green"></div>
                <div class="text-sm font-medium text-brand-black">${trip.dropoff}</div>
            </div>
            <div class="bg-brand-lightgray p-3 rounded-xl flex items-center justify-between mt-3">
                <div class="flex items-center gap-3">
                    <img src="${trip.driver.photo}" class="w-8 h-8 rounded-full object-cover" />
                    <div>
                        <div class="text-xs font-bold text-brand-black">${trip.driver.name}</div>
                        <div class="text-[10px] text-gray-500">${trip.driver.vehicle}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-bold text-brand-black">${trip.price}</div>
                    <div class="text-[10px] text-brand-green font-semibold">Llegada: ${trip.driver.eta}</div>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function showNotification(msg) {
    const notif = document.createElement('div');
    notif.className = 'fixed bottom-6 right-6 z-50 bg-brand-black text-white px-5 py-3 rounded-xl shadow-soft text-xs font-medium animate-fade-in flex items-center gap-2';
    notif.innerHTML = `<span class="w-2 h-2 rounded-full bg-brand-green"></span> ${msg}`;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3500);
}
