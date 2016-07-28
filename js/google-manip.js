// make address list toggled by hamburger button
var hamburgerBtn = document.getElementById('hamburger-btn');
var addressList = document.getElementById('address-list');
var googleMap = document.getElementById('google-map');

hamburgerBtn.addEventListener('click', function () {
    addressList.classList.toggle('open');
});

googleMap.addEventListener('click', function () {
    addressList.classList.remove('open');
});

// load Google Map
function initMap () {
    // define a basic map with necessary data
    var map = new google.maps.Map(googleMap, {
        center: {lat: 40.4442526, lng: -79.9554277},
        zoom: 18
    });

    // show all markers depend on address data
    var markers = [];
    var largeInfoWindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < initialAddresses.length; i++) {
        var title = initialAddresses[i].title;
        var position = initialAddresses[i].location;

        var markerObj = {
            map: map,
            title: title,
            position: position,
            animation: google.maps.Animation.DROP,
            id: i
        }

        var marker = new google.maps.Marker(markerObj);

        markers.push(marker);
        // collect every marker into bounds
        bounds.extend(marker.position);
    }
    // make sure every marker is inside the map
    map.fitBounds(bounds);
}
