const socket = io();
let userLocation = null;
let mapInitialized = false;

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const {latitude, longitude} = position.coords;
        userLocation = {latitude, longitude};
        socket.emit("send-location", {latitude, longitude});

        if (!mapInitialized) {
            map.setView([latitude, longitude], 16);
            mapInitialized = true;
        }
    }, (error) => {
        console.log(error);
    }, {
        enableHighAccuracy: true,
        timeout: 500,
        maximumAge: 0
    });
}

const map = L.map("map").setView([0, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap"
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    const {id, latitude, longitude} = data;

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {  
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
