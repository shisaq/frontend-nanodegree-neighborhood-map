var Address = function (data) {
    this.title = ko.observable(data.title);
}

var ViewModel = function () {
    var self = this;

    this.addressList = ko.observableArray([]);
    initialAddresses.forEach(function (addressItem) {
        self.addressList.push(new Address(addressItem));
    })
};

ko.applyBindings(new ViewModel());
