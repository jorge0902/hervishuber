// HervisHuber MapLibre GL JS & App Logic - 21st Century SaaS UX

const drivers = [
  {
    id: 1,
    name: "Ahmed Al-Mansoori",
    lat: 25.2532,
    lng: 55.3644,
    vehicle: "Toyota Camry Hybrid",
    rating: 4.9,
    eta: "3 min",
    zone: "DXB Airport",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
    heading: 45
  },
  {
    id: 2,
    name: "Carlos Mendoza",
    lat: 25.1972,
    lng: 55.2744,
    vehicle: "Tesla Model Y",
    rating: 5.0,
    eta: "5 min",
    zone: "Downtown Dubai",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop",
    heading: 120
  },
  {
    id: 3,
    name: "Mohamed Tariq",
    lat: 25.0772,
    lng: 55.1412,
    vehicle: "Lexus ES 300h",
    rating: 4.8,
    eta: "4 min",
    zone: "Dubai Marina / JLT",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
    heading: 210
  },
  {
    id: 4,
    name: "Elena Rostova",
    lat: 25.1850,
    lng: 55.2650,
    vehicle: "Mercedes-Benz E-Class",
    rating: 4.95,
    eta: "2 min",
    zone: "Business Bay",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
    heading: 300
  }
];

let map = null;
let selectedDriver = drivers[1]; // Default Carlos (Downtown)
const driverMarkers = [];
let bottomSheetCollapsed = false;

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    setupTripForm();
    setupBottomSheet();
});

function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof maplibregl === 'undefined') return;

    // Carto Positron minimal Vector/Raster Tile style
    map = new maplibregl.Map({
        container: 'map',
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [55.2744, 25.1972], // Centered on Downtown Dubai
        zoom: 12.5,
        attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

    // User Geolocation Detection
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLng = position.coords.longitude;
                const userLat = position.coords.latitude;

                map.flyTo({ center: [userLng, userLat], zoom: 14 });

                // Custom User Marker (Blue glowing pulse)
                const userEl = document.createElement('div');
                userEl.className = 'relative flex items-center justify-center w-6 h-6';
                userEl.innerHTML = `
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-lg"></span>
                `;

                new maplibregl.Marker({ element: userEl })
                    .setLngLat([userLng, userLat])
                    .setPopup(new maplibregl.Popup({ offset: 15 }).setHTML('<div class="p-2 text-xs font-semibold text-gray-900">Tu ubicación actual</div>'))
                    .addTo(map);
            },
            () => {
                console.log('Geolocalización por defecto en Dubái Downtown.');
            }
        );
    }

    // Custom Driver Markers Setup
    drivers.forEach(driver => {
        const el = document.createElement('div');
        el.className = 'driver-marker group cursor-pointer';
        el.innerHTML = `
            <div class="relative flex items-center justify-center w-11 h-11 bg-brand-black text-white rounded-full shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                <span class="absolute -top-1 -right-1 w-3 h-3 bg-brand-green border-2 border-white rounded-full emerald-pulse"></span>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 1 12.7V16c0 .6.4 1 1 1h2"/>
                    <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
                </svg>
            </div>
        `;

        const popupContent = `
            <div class="p-3 text-brand-black max-w-[210px]">
                <div class="flex items-center gap-3 mb-2">
                    <img src="${driver.photo}" class="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" alt="${driver.name}"/>
                    <div>
                        <div class="font-bold text-xs text-brand-black">${driver.name}</div>
                        <div class="text-[10px] text-emerald-600 font-semibold">${driver.vehicle}</div>
                    </div>
                </div>
                <div class="flex items-center justify-between text-xs mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span class="font-bold text-emerald-600">★ ${driver.rating}</span>
                    <span class="font-medium text-gray-600">ETA: ${driver.eta}</span>
                </div>
                <button onclick="selectDriver(${driver.id})" class="w-full bg-brand-black text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1">
                    <span>Seleccionar</span>
                    <svg class="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
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

    // Start Smooth Continuous Movement Animation
    startSmoothVehicleMovement();
}

function selectDriver(driverId) {
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
        selectedDriver = driver;
        const driverInfoEl = document.getElementById('selected-driver-info');
        if (driverInfoEl) {
            driverInfoEl.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-brand-green emerald-pulse"></span>
                    <span class="font-bold text-brand-black">${driver.name}</span>
                    <span class="text-gray-400">•</span>
                    <span class="text-emerald-600 font-medium">${driver.vehicle}</span>
                </div>
            `;
        }
        showNotification(`Conductor seleccionado: ${driver.name} (${driver.vehicle})`);
    }
}

// Smooth Continuous Vehicle Animation Loop
function startSmoothVehicleMovement() {
    setInterval(() => {
        driverMarkers.forEach(item => {
            // Realistic small directional movement vector
            const moveStep = 0.0003;
            const angle = (item.data.heading + (Math.random() * 40 - 20)) * (Math.PI / 180);

            item.data.lng += Math.cos(angle) * moveStep;
            item.data.lat += Math.sin(angle) * moveStep;

            // Update marker coordinates smoothly
            item.marker.setLngLat([item.data.lng, item.data.lat]);
        });
    }, 2000);
}

// Mobile Bottom Sheet Interactive Handler
function setupBottomSheet() {
    const sheet = document.getElementById('bottom-sheet');
    const handle = document.getElementById('sheet-handle');

    if (sheet && handle) {
        handle.addEventListener('click', () => {
            toggleBottomSheet();
        });
    }
}

function toggleBottomSheet() {
    const sheet = document.getElementById('bottom-sheet');
    const toggleIcon = document.getElementById('sheet-toggle-icon');

    if (!sheet) return;

    bottomSheetCollapsed = !bottomSheetCollapsed;

    if (bottomSheetCollapsed) {
        sheet.classList.remove('expanded');
        sheet.classList.add('collapsed');
        if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'chevron-up');
    } else {
        sheet.classList.remove('collapsed');
        sheet.classList.add('expanded');
        if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'chevron-down');
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function setupTripForm() {
    const form = document.getElementById('trip-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const pickup = document.getElementById('pickup-input')?.value || "Aeropuerto de Dubái (DXB)";
        const dropoff = document.getElementById('dropoff-input')?.value || "Dubai Marina Promenade";
        const price = document.getElementById('est-price')?.innerText || "AED 120";
        const time = document.getElementById('est-time')?.innerText || "~25 min";
        const distance = "14.2 km";

        const tripData = {
            id: 'HH-' + Math.floor(100000 + Math.random() * 900000),
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

        showConfirmationModal(tripData);
    });
}

function showConfirmationModal(trip) {
    const modal = document.getElementById('confirm-modal');
    const details = document.getElementById('modal-trip-details');
    if (!modal || !details) {
        alert(`¡Viaje Confirmado!\n\nID: ${trip.id}\nRecogida: ${trip.pickup}\nDestino: ${trip.dropoff}\nConductor: ${trip.driver.name} (${trip.driver.vehicle})\nPrecio: ${trip.price}`);
        return;
    }

    details.innerHTML = `
        <div class="space-y-3 text-left my-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div class="flex justify-between items-center pb-2 border-b border-gray-200">
                <span class="text-xs font-semibold text-gray-500 uppercase">Reserva ID</span>
                <span class="font-mono text-xs font-bold text-emerald-600">${trip.id}</span>
            </div>
            <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full bg-brand-black"></div>
                <div class="text-xs font-semibold text-brand-black truncate">${trip.pickup}</div>
            </div>
            <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-sm bg-brand-green"></div>
                <div class="text-xs font-semibold text-brand-black truncate">${trip.dropoff}</div>
            </div>
            <div class="bg-white p-3 rounded-lg flex items-center justify-between border border-gray-100 mt-2">
                <div class="flex items-center gap-3">
                    <img src="${trip.driver.photo}" class="w-9 h-9 rounded-full object-cover" />
                    <div>
                        <div class="text-xs font-bold text-brand-black">${trip.driver.name}</div>
                        <div class="text-[10px] text-emerald-600 font-semibold">${trip.driver.vehicle}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-extrabold text-brand-black">${trip.price}</div>
                    <div class="text-[10px] text-brand-green font-bold">Llegada: ${trip.driver.eta}</div>
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
    notif.className = 'fixed bottom-6 right-6 z-50 bg-brand-black text-white px-5 py-3 rounded-xl shadow-soft text-xs font-semibold animate-fade-in flex items-center gap-2 border border-gray-800';
    notif.innerHTML = `<span class="w-2 h-2 rounded-full bg-brand-green emerald-pulse"></span> ${msg}`;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3500);
}
