var Address = function (data) {
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
}

var ViewModel = function () {
    var self = this;

    // build address list from data.js, and show them on the page
    this.addressList = ko.observableArray([]);
    initialAddresses.forEach(function (addressItem) {
        self.addressList.push(new Address(addressItem));
    });

    this.currentAddress = ko.observable(self.addressList()[0]);
    console.log(this.currentAddress().location());
};

ko.applyBindings(new ViewModel());
