getPromise = (url) => {
    return new Promise((resolve, reject) => {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.status == 401) {
                reject(JSON.parse(this.responseText));
            }
            resolve(JSON.parse(this.responseText));
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    });
};

async function sendAJAX(url) {
    try {
        const promises = [getPromise(url)];
        return await Promise.all(promises);
    } catch (err) {
        console.log(err);
    }
}

var vueinst = new Vue({
    el: '#content',
    data() {
        return {
            query: "Search for venues by name",
            hasVenues: false,
            venue: [{
                VenueID: "No venue found",
                Name: "",
                Address: "",
                ContactNumber: ""
            }]
        }
    },
    methods: {
        async searchVenue() {
            if (this.query.length > 2) {
                var venue = await sendAJAX("/admin/venues?name="+this.query);
                if (venue[0].length > 0) {
                    this.hasVenues = true;
                    this.venue = venue[0];
                } else {
                    this.hasVenues = false;
                }
            } else {
                this.hasVenues = false;
                this.venue = [{
                    VenueID: "No user found",
                    Name: "",
                    Address: "",
                    ContactNumber: ""
                }];
            }
        }
    },
    watch: {
        query: function (val) {
            if (this.query.length > 2) {
                this.searchVenue();
                console.log(this.venue);
            }
        }
    }
});
