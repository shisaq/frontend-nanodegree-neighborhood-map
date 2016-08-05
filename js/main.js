// start knockoutJS viewmodel
var pickAddressViewModel = function () {
    // store this in self
    var self = this;
    // store bounds to make every marker fits on the map
    self.bounds = new google.maps.LatLngBounds();
    // store info window to make sure just show 1 info window
    self.infoWindow = new google.maps.InfoWindow();

    // generate address class
    var Address = function (data) {
        this.title = ko.observable(data.title);
        this.location = ko.observable(data.location);
        this.marker = new google.maps.Marker({
            title: this.title(),
            position: this.location(),
            map: map,
            icon: googleFunc.makeMarkerIcon('db6b6c'),
            animation: google.maps.Animation.DROP,
        }, this);
        this.marker.addListener('click', function() {
            // toggle the marker animation
            googleFunc.toggleBounce(this);
            // show the info window
            googleFunc.populateInfoWindow(this, self.infoWindow);
        });
        // when mouse over, highlight the marker
        this.marker.addListener('mouseover', function () {
            this.setIcon(googleFunc.makeMarkerIcon('325165'));
        });
        // when mouse out, make the marker color back to default
        this.marker.addListener('mouseout', function () {
            this.setIcon(googleFunc.makeMarkerIcon('db6b6c'));
        });
    };

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
    // run fit bounds to make every marker inside the map
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
};

// define several google map functions,and encapsulate them
var googleFunc = {
    // custimize marker color by giving hexadecimal number
    makeMarkerIcon: function (markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 42),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 42),
            new google.maps.Size(21,42));
        return markerImage;
    },

    // toggle marker animation
    toggleBounce: function (marker) {
        if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
      }
    },

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    populateInfoWindow: function (marker, infowindow) {
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
}
