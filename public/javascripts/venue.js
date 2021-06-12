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
            venue: null,
            checkIn: null
        }
    },
    async mounted() {
        var profile = await sendAJAX("/api/venue");
        this.venue = profile[0];
        var checkIn = await sendAJAX("/api/check-in");
        for (entry in checkIn[0]) {
            const oldStamp = checkIn[0][entry].Date
            checkIn[0][entry].Date = new Date(oldStamp).toLocaleDateString()+" "+new Date(oldStamp).toLocaleTimeString();
        }
        this.checkIn = checkIn[0];
    }
});
