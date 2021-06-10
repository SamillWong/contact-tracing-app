var vueinst = new Vue({
    el: '#content',
    data() {
        return {
            user: null
        }
    },
    async mounted() {
        getPromise = () => {
            return new Promise((resolve, reject) => {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function () {
                    if (this.status == 401) {
                        reject(JSON.parse(this.responseText));
                    }
                    resolve(JSON.parse(this.responseText));
                };
                xmlhttp.open("GET", "/api/profile", true);
                xmlhttp.send();
            });
        };

        async function sendAJAX() {
            try {
                const promises = [getPromise()];
                return await Promise.all(promises);
            } catch (err) {
                console.log(err);
            }
        }
        this.user = await sendAJAX();
    }
});
