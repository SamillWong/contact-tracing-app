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
            currentCheckIn: 0,
            checkIn: [{
                CheckInID: "No entries found",
                Date: "",
                Name: "",
                Address: ""
            }]
        }
    },
    async mounted() {
        var checkIn = await sendAJAX("/api/check-in");
        if (checkIn != "[]") {
            for (entry in checkIn[0]) {
                const oldStamp = checkIn[0][entry].Date
                checkIn[0][entry].Date = new Date(oldStamp).toLocaleDateString()+" "+new Date(oldStamp).toLocaleTimeString();
            }
            this.checkIn = checkIn[0];
        }
    }
});
