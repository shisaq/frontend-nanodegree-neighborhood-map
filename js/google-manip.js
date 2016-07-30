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

    var defaultIcon = makeMarkerIcon('db6b6c');
    var highlightIcon = makeMarkerIcon('325165');

    for (var i = 0; i < initialAddresses.length; i++) {
        var title = initialAddresses[i].title;
        var position = initialAddresses[i].location;

        var markerObj = {
            map: map,
            title: title,
            position: position,
            icon: defaultIcon,
            animation: google.maps.Animation.DROP,
            id: i
        }

        var marker = new google.maps.Marker(markerObj);

        markers.push(marker);

        // collect every marker into bounds
        bounds.extend(marker.position);

        // when mouse over, highlight the marker
        marker.addListener('mouseover', function () {
            this.setIcon(highlightIcon);
        });
        // when mouse out, make the marker color back to default
        marker.addListener('mouseout', function () {
            this.setIcon(defaultIcon);
        });
        // when click, make the marker bounce
        marker.addListener('click', function (markerCopy) {
            return function () {
                if (markerCopy.getAnimation() !== null) {
                    markerCopy.setAnimation(null);
                } else {
                    markerCopy.setAnimation(google.maps.Animation.BOUNCE);
                }
            };
        }(marker));
    }
    // make sure every marker is inside the map
    map.fitBounds(bounds);
}

// custimize marker color by giving hexadecimal number
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 42),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 42),
        new google.maps.Size(21,42));
    return markerImage;
}
