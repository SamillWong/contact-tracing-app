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
            hasAlerts: false,
            alert: [{
                HotspotID: "No alerts found",
                Date: "",
                Name: "",
                Address: ""
            }]
        }
    },
    async mounted() {
        var alert = await sendAJAX("/api/alert");
        if (alert[0].length > 0) {
            for (entry in alert[0]) {
                const oldStamp = alert[0][entry].Date
                alert[0][entry].Date = new Date(oldStamp).toLocaleDateString()+" "+new Date(oldStamp).toLocaleTimeString();
            }
            this.hasAlerts = true;
            this.alert = alert[0];
        }
    }
});
