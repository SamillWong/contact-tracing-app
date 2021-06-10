// Google OAuth sign out function
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}

/*
 * This function runs on Google sign in to check whether if the email exists in the database.
 * If it does, it attaches req.verified to the user, as well as req.userid for use later.
 */
// TODO: Might have to change that to req.session.userid
function verifyDB(gmail) {

    var urlencodesend = "user=" + gmail;
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            alert("Email Verified");

        } else if (this.readyState == 4 && this.status >= 400) {
            alert("This email does not appear to be registered. Please sign up for an account");
            // Reverts Google login button to its default state
            signOut();
        }
    };

    // Open connection to server and send the token using a POST request
    xmlhttp.open("POST", "/users/login/verifyDB", true);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlhttp.send(urlencodesend);
}

function onSignIn(googleUser) {

    // Read the token data on the client side
    var profile = googleUser.getBasicProfile();

    //console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    //console.log('Name: ' + profile.getName());
    //console.log('Image URL: ' + profile.getImageUrl());
    //console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

    var usermail = profile.getEmail();

    // Prepare to send the TOKEN to the server for validation
    var id_token = { token: googleUser.getAuthResponse().id_token };

    // Create AJAX Request
    // FIXME: I want to find a way to use verifyDB before this function call and only run this if it returns true, but AJAX is asynchronous... :(
    var xmlhttp = new XMLHttpRequest();

    // Define function to run on response
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            alert("Google Authentication Suceeded");
            verifyDB(usermail);
        } else if (this.readyState == 4 && this.status >= 400) {
            alert("Google Authentication Failed");
        }
    };

    // Open connection to server & send the token using a POST request
    xmlhttp.open("POST", "/users/login", true);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send(JSON.stringify(id_token));
}

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