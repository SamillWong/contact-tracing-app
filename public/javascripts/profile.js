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

function edit(){
    vueinst.editON=!vueinst.editON;
}

var vueinst = new Vue({
    el: '#content',
    data() {
        return {
            user: null,
            checkIn: [{
                CheckInID: "No entries found",
                Date: "",
                Name: "",
                Address: ""
            }],
            editON: true,
        }
    },
    async mounted() {
        var profile = await sendAJAX("/api/profile");
        this.user = profile[0];
        var checkIn = await sendAJAX("/api/check-in");
        if (checkIn[0].length > 0) {
            for (entry in checkIn[0]) {
                const oldStamp = checkIn[0][entry].Date
                checkIn[0][entry].Date = new Date(oldStamp).toLocaleDateString()+" "+new Date(oldStamp).toLocaleTimeString();
            }
            this.checkIn = checkIn[0];
        }
    }
});
