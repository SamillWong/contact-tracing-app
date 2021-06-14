// Google OAuth sign out function
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut();
}

/*
 * This function runs on Google sign in to check whether if the email exists in the database.
 * If it does, it grants the user a session.
 */
function verifyDB(gmail) {

    var urlencodesend = "user=" + gmail;
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            window.location.replace('/profile');
        } else if (this.readyState == 4 && this.status >= 400) {
            alert("This email does not appear to be registered. Please sign up for an account");
            window.location.replace('/register');
        }
    };

    // Open connection to server and send the token using a POST request
    xmlhttp.open("POST", "/oauth/verify", true);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlhttp.send(urlencodesend);
}

function onSignIn(googleUser) {

    var auth2 = gapi.auth2.getAuthInstance();

    // Read the token data on the client side
    var profile = googleUser.getBasicProfile();
    var usermail = profile.getEmail();

    // Prepare to send the TOKEN to the server for validation
    var id_token = { token: googleUser.getAuthResponse().id_token };

    auth2.disconnect();

    // Create AJAX Request
    var xmlhttp = new XMLHttpRequest();

    // Define function to run on response
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            verifyDB(usermail);
        } else if (this.readyState == 4 && this.status >= 400) {
            alert("Google Authentication Failed");
        }
    };

    // Open connection to server & send the token using a POST request
    xmlhttp.open("POST", "/oauth/token", true);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send(JSON.stringify(id_token));
}