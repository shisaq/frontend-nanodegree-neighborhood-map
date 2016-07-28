var Address = function (data) {
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
}

var ViewModel = function () {
    var self = this;

    // get the search value and store it into currentAddress
    this.currentAddress = ko.observable('');

    // build address list from data.js, and show them on the page
    this.addressList = ko.observableArray([]);
    initialAddresses.forEach(function (addressItem) {
        self.addressList.push(new Address(addressItem));
    });

    // when click on an address, update the input area value
    this.updateCurrentAddress = function (currentAddress) {
        self.currentAddress(currentAddress);
    }
};

ko.applyBindings(new ViewModel());
