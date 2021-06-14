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
            query: "Search for users by name",
            hasUsers: false,
            user: [{
                UserID: "No user found",
                FirstName: "",
                LastName: "",
                Address: "",
                ContactNumber: ""
            }]
        }
    },
    methods: {
        async searchUser() {
            if (this.query.length > 2) {
                var user = await sendAJAX("/admin/users?name="+this.query);
                if (user[0].length > 0) {
                    this.hasUsers = true;
                    this.user = user[0];
                } else {
                    this.hasUsers = false;
                }
            } else {
                this.hasUsers = false;
                this.user = [{
                    UserID: "No user found",
                    FirstName: "",
                    LastName: "",
                    Address: "",
                    ContactNumber: ""
                }];
            }
        }
    },
    watch: {
        query: function (val) {
            this.searchUser();
        }
    }
});
