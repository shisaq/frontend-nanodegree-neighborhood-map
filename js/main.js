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
    self.currentAddress().title = ko.observable(null);
    console.log(self.currentAddress().title());
    // when click on an address, update the input area value
    self.updateCurrentAddress = function (currentAddress) {
        self.currentAddress(currentAddress);
        console.log(self.currentAddress().title());
    };

    // filter the address list by current address
    self.shouldShowOut = function (addressTitle) {
        // get the current title from input area
        var inputTitle = self.currentAddress().title();

        // when current address is null, that means no input,
        // so every address should be visible
        if (inputTitle === null) {
            console.log(inputTitle);
            return ko.observable(true);
        } else {
            // compare the addresses in the list with current address
            // `addressTitle` means an address in address list;
            // `toLowerCase` makes the input not essensial on letter case;
            // `indexOf` judges if the input (inside the parenthis) is a part of
            // the address. Reference from stack overflow:
            // http://stackoverflow.com/a/3480785/5769598
            if (addressTitle().toLowerCase().indexOf(inputTitle.toLowerCase()) >= 0) {
                return ko.observable(true);
            } else {
                return ko.observable(false);
            }
        }
    };
};

ko.applyBindings(new ViewModel());
