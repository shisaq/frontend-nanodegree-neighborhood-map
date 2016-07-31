// make address list toggled by hamburger button when width < 730px
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
var map;
var markers = [];
function initMap () {
    // define a basic map with necessary data
    map = new google.maps.Map(googleMap, {
        center: {lat: 40.4442526, lng: -79.9554277},
        zoom: 18
    });

    // show all markers depend on address data
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
        // when click, toggle the marker bounce, and show the street view
        marker.addListener('click', function () {
            // toggle marker animation
            toggleBounce(this);
            // show the street view, referenced by Google Map API course
            populateInfoWindow(this, largeInfoWindow);
        });
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

// toggle marker animation
function toggleBounce(marker) {
    for (var i = 0; i < markers.length; i++) {
        if(markers[i].id !== marker.id) {
            markers[i].setAnimation(null);
        } else {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        }
    }
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
            // set marker animation to null when click close button
            marker.setAnimation(null);
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<h2>' + marker.title +
                    '</h2><div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent('<h2>' + marker.title + '</h2>' +
                    '<div>No Street View Found</div>');
            }
        }
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}
