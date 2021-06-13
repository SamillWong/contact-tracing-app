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
            hotspot: null,
        }
    },
    async mounted() {
        var hotspot = await sendAJAX("/api/hotspot");
        for (entry in hotspot[0]) {
            const oldStamp = hotspot[0][entry].Date
            hotspot[0][entry].Date = new Date(oldStamp).toLocaleDateString()+" "+new Date(oldStamp).toLocaleTimeString();
        }
        this.hotspot = hotspot[0];
    }
});
