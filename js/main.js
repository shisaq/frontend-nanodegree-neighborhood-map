// generate address class
var Address = function (data) {
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
}

// start knockoutJS viewmodel
var pickAddressViewModel = function () {
    var self = this;

    // build address list from data.js, and show them on the page
    self.addressList = ko.observableArray([]);
    initialAddresses.forEach(function (addressItem) {
        self.addressList.push(new Address(addressItem));
    });

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
                return ko.observable(true);
            } else {
                return ko.observable(false);
            }
        }
    };
};

ko.applyBindings(new pickAddressViewModel());
