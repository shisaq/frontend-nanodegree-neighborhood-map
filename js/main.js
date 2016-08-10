/* start knockoutJS viewmodel */
var pickAddressViewModel = function () {
    // store this in self
    var self = this;
    // store bounds to make every marker fits on the map
    self.bounds = new google.maps.LatLngBounds();
    // store info window to make sure just show 1 info window
    self.infoWindow = new google.maps.InfoWindow({
        maxWidth: 300
    });

    // generate address class
    var Address = function (data) {
        this.title = ko.observable(data.title);
        this.location = ko.observable(data.location);
        // marker is used for google map api
        this.marker = new google.maps.Marker({
            title: this.title(),
            position: this.location(),
            map: map,
            icon: self.makeMarkerIcon('db6b6c'),
            animation: google.maps.Animation.DROP,
        }, this);
        this.marker.addListener('click', function() {
            // toggle the marker animation
            self.toggleBounce(this);
            // show the info window
            self.populateInfoWindow(this, self.infoWindow);
        });
        // when mouse over, highlight the marker
        this.marker.addListener('mouseover', function () {
            this.setIcon(self.makeMarkerIcon('325165'));
        });
        // when mouse out, make the marker color back to default
        this.marker.addListener('mouseout', function () {
            this.setIcon(self.makeMarkerIcon('db6b6c'));
        });
    };

    /* define several functions to use */

    // customize marker color by giving hexadecimal number
    self.makeMarkerIcon = function (markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 42),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 42),
            new google.maps.Size(21,42));
        return markerImage;
    };

    // toggle marker animation
    self.toggleBounce = function (marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        window.setTimeout(function() {
            marker.setAnimation(null);
        }, 1400);
    };

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position. Referenced by google map api course
    self.populateInfoWindow = function (marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            // Clear the infowindow content to give the streetview time to load.
            infowindow.setContent('');
            infowindow.marker = marker;
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
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
                    infowindow.setContent('<h2 id="marker-title">' + marker.title +
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
                    infowindow.setContent('<h2 id="marker-title">' + marker.title + '</h2>' +
                        '<div>No Street View Found</div>');
                }
            }
            // Use streetview service to get the closest streetview image within
            // 50 meters of the markers position
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
            // Open the infowindow on the correct marker.
            infowindow.open(map, marker);

            // load foursquare API
            foursquareUrl = 'https://api.foursquare.com/v2/venues/explore?client_id=' +
                foursquare_CLIENT_ID + '&client_secret=' + foursquare_CLIENT_SECRET +
                '&m=foursquare&v=20140806&ll=' + marker.position.lat() + ',' +
                marker.position.lng() + '&query=' + marker.title;
            $.ajax({
                url: foursquareUrl,
                cache: false
            })
            .done(function(data) {
                var link = data.response.groups[0].items[0].tips[0].canonicalUrl;
                var rating = data.response.groups[0].items[0].venue.rating;
                if (!link && !rating) {
                    // this means nothing about the address
                    $('#marker-title').append('<h3>This place has not been on Foursquare.</h3>');
                } else {
                    // append the content after #marker-title in infowindow
                    $('#marker-title').append('<h3>Foursquare Rating: <span class="rating">' +
                                          rating + '</span></h3>' + '<a class="fsqure-link" href="' +
                                          link + '" target="new">Foursquare Link</a>');
                }
            })
            .fail(function() {
                alert('Foursquare data failed to load.');
            });
        }
    };

    // build address list from data.js, and show them on the page
    self.addressList = ko.observableArray([]);
    initialAddresses.forEach(function (addressItem) {
        // instance an address class with the data in initialAddresses
        var address = new Address(addressItem);
        // push it into addressList
        self.addressList().push(address);
        // update google bounds by adding new lat and lng
        self.bounds.extend(address.marker.position);
    });

    // track the input value
    self.currentAddress = ko.observable('');

    // show the info window of the clicked address
    self.updateCurrentAddress = function (clickedAddress) {
        // hide the address list so that it'll not in the way of info window
        self.currentStatus(-50);
        // toggle the marker animation
        self.toggleBounce(clickedAddress.marker);
        // show the info window
        self.populateInfoWindow(clickedAddress.marker, self.infoWindow);
    };

    // clear the current address
    self.clearCurrentAddress = function () {
        self.currentAddress('');
    };

    // define default address list is hide
    self.currentStatus = ko.observable(-50);
    // toggle address list by clicking hamburger button
    self.toggleAddressList = function () {
        return self.currentStatus() < 0 ?
            self.currentStatus(150000) :
            self.currentStatus(-50);
    };

    // make filtered address list depending on the input value
    self.filteredList = ko.computed(function() {
        if (self.currentAddress() === null) {
            // no input, return the default list
            return self.addressList();
        } else {
            // store the input value, without matching case
            var filter = self.currentAddress().toLowerCase();
            // you can find documentation on arrayFilter here:
            // http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
            return ko.utils.arrayFilter(self.addressList(), function(addressItem) {
                if(addressItem.title().toLowerCase().indexOf(filter) >= 0) {
                    // show the marker on google map
                    addressItem.marker.setVisible(true);
                    // follows same rules as Array.prototype.filter
                    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
                    // when return true, we "keep" the element
                    return true;
                } else {
                    // this case, ignore the address item, and set the marker invisible
                    addressItem.marker.setVisible(false);
                    // when return false, it is not in the returned array
                    return false;
                }
                // note that if we did not need to keep track of marker visibility, we could
                // shorten code by doing this:
                // return addressItem.title().toLowerCase().indexOf(filter) >= 0
            });
        }
    });

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

var googleError = function () {
    alert('Google Map failed to load.');
};
