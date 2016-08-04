// start knockoutJS viewmodel
var pickAddressViewModel = function () {
    // generate address class
    var Address = function (data) {
        this.title = ko.observable(data.title);
        this.location = ko.observable(data.location);
        this.marker = new google.maps.Marker({
            title: this.title(),
            position: this.location(),
            map: map,
            icon: makeMarkerIcon('db6b6c'),
            animation: google.maps.Animation.DROP,
        }, this);
        this.marker.addListener('click', toggleBounce);
        // when mouse over, highlight the marker
        this.marker.addListener('mouseover', function () {
            this.setIcon(makeMarkerIcon('325165'));
        });
        // when mouse out, make the marker color back to default
        this.marker.addListener('mouseout', function () {
            this.setIcon(makeMarkerIcon('db6b6c'));
        });
    };

    // store this in self
    var self = this;
    // store bounds to make every marker fits on the map
    self.bounds = new google.maps.LatLngBounds();

    // build address list from data.js, and show them on the page
    self.addressList = ko.observableArray([]);
    initialAddresses.forEach(function (addressItem) {
        self.addressList().push(new Address(addressItem));
    });

    // add marker position into bounds
    self.addressList().forEach(function (addressItem) {
        self.bounds.extend(addressItem.marker.position);
    })

    // define the initial currentAddress to null from data.js
    self.currentAddress = new Address(initialCurrentAddress);

    // set current address to the recently clicked address
    self.updateCurrentAddress = function (clickedAddress) {
        self.currentAddress.title(clickedAddress.title());
        self.currentAddress.location(clickedAddress.location());
    };

    // define default address list is hide
    self.currentStatus = ko.observable(-50);
    // toggle address list by clicking hamburger button
    self.toggleAddressList = function () {
        return self.currentStatus() < 0 ?
            self.currentStatus(150000) :
            self.currentStatus(-50);
    };

    // filter the address list by current address
    self.shouldShowOut = function (addressItem) {
        // get the current title from input area
        var inputTitle = self.currentAddress.title();

        // when current address is null, that means no input,
        // so every address should be visible
        if (inputTitle === null) {
            return ko.observable(true);
        } else {
            // compare the addresses in the list with current address
            // `addressItem` means every address item object;
            // `toLowerCase` makes the input not essensial on letter case;
            // `indexOf` judges if the input (inside the parenthis) is a part of
            // the address. Reference from stack overflow:
            // http://stackoverflow.com/a/3480785/5769598
            if (addressItem.title().toLowerCase().indexOf(inputTitle.toLowerCase()) >= 0) {
                addressItem.marker.setVisible(true);
                return ko.observable(true);
            } else {
                addressItem.marker.setVisible(false);
                return ko.observable(false);
            }
        }
    };
    map.fitBounds(self.bounds);
};

// load Google Map
var initMap = function () {
    var markers = [];
    // define a basic map with necessary data
    map = new google.maps.Map(document.getElementById('google-map'), {
        center: {lat: 40.4442526, lng: -79.9554277},
        zoom: 13
    });

    // Instantiate ViewModel
    ko.applyBindings(new pickAddressViewModel());

    // // show all markers depend on address data
    var largeInfoWindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();


    // for (var i = 0; i < addressList().length; i++) {
    //     var title = addressList()[i].title;
    //     var position = addressList()[i].location;
    //     var marker = addressList()[i].marker;

    //     // var markerObj = {
    //     //     map: map,
    //     //     title: title,
    //     //     position: position,
    //     //     icon: defaultIcon,
    //     //     animation: google.maps.Animation.DROP,
    //     //     id: i
    //     // }

    //     // var marker = new google.maps.Marker(markerObj);

    //     // markers.push(marker);

    //     // collect every marker into bounds
    //     bounds.extend(marker.position);

    //     // when mouse over, highlight the marker
    //     marker.addListener('mouseover', function () {
    //         this.setIcon(highlightIcon);
    //     });
    //     // when mouse out, make the marker color back to default
    //     marker.addListener('mouseout', function () {
    //         this.setIcon(defaultIcon);
    //     });
    //     // when click, toggle the marker bounce, and show the street view
    //     marker.addListener('click', function () {
    //         // toggle marker animation
    //         toggleBounce(this);
    //         // show the street view, referenced by Google Map API course
    //         populateInfoWindow(this, largeInfoWindow);
    //     });
    // }
    // // make sure every marker is inside the map
    // map.fitBounds(bounds);
};

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
function toggleBounce() {
    if (this.getAnimation() !== null) {
    this.setAnimation(null);
  } else {
    this.setAnimation(google.maps.Animation.BOUNCE);
  }
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != this) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = this;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
            // set marker animation to null when click close button
            this.setAnimation(null);
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
                nearStreetViewLocation, this.position);
                infowindow.setContent('<h2>' + this.title +
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
                infowindow.setContent('<h2>' + this.title + '</h2>' +
                    '<div>No Street View Found</div>');
            }
        }
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(this.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, this);
    }
}
