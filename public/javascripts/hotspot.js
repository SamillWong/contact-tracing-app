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
            currentHotspot: 0,
            hasHotspots: false,
            hotspot: [{
                HotspotID: "No hotspots found",
                Date: "",
                Name: "",
                Address: ""
            }],
        }
    },
    async mounted() {
        var hotspot = await sendAJAX("/api/hotspot");
        if (hotspot[0].length > 0) {
            for (entry in hotspot[0]) {
                const oldStamp = hotspot[0][entry].Date
                hotspot[0][entry].Date = new Date(oldStamp).toLocaleDateString()+" "+new Date(oldStamp).toLocaleTimeString();
            }
            this.hasHotspots = true;
            this.hotspot = hotspot[0];
        }
    }
});
