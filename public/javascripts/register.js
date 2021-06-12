/* Register password confirmation */
function matching(input) {
    if (input.value != document.getElementById('password').value) {
        input.setCustomValidity('Passwords must be the same');
    }
    // Password is valid, reset error message
    else {
        input.setCustomValidity('');
    }
}

var vuerego = new Vue({
    el: '#venueRego',
    data: {
        venueregotf: true,
        isrequired: "required",
    }
});