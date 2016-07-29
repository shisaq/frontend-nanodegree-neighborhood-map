var Address = function (data) {
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
}

var ViewModel = function () {
    var self = this;

    // build address list from data.js, and show them on the page
    self.addressList = ko.observableArray([]);
    initialAddresses.forEach(function (addressItem) {
        self.addressList.push(new Address(addressItem));
    });

    // define the initial currentAddress to null from data.js
    self.currentAddress = ko.observable(initialCurrentAddress);
    // when click on an address, update the input area value
    this.updateCurrentAddress = function (currentAddress) {
        self.currentAddress(currentAddress);
    };
};

ko.applyBindings(new ViewModel());
