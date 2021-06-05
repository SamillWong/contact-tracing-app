function signOut() { // google oauth signout function
    var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}



/*
    this function runs on google signin to check whether the email exists in our database.
    If it does it attaches req.verified=true/false to the user as well as req.userid for use later.
    **Might have to change that to req.session.userid? not too sure how it works.

*/

function verifyDB(gmail){ //

    var urlencodesend="user="+gmail;
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("Email Verified");


        } else if (this.readyState == 4 && this.status >= 400) {
            alert("This email does not appear to be registered. Please sign up for an account");
            signOut(); //just reverts the default state of the google log on button
        }
    };

    // Open connection to server & send the token using a POST request
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

    var usermail=profile.getEmail();

    // Prepare to send the TOKEN to the server for validation
    var id_token = { token: googleUser.getAuthResponse().id_token };

        // Create AJAX Request

        //I want to find a way to use verifyDB before this function call and only run this if it returns true, but AJAX is asyncronous... :(
        var xmlhttp = new XMLHttpRequest();

        // Define function to run on response
        xmlhttp.onreadystatechange = function() {
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


function matching(input) {
        if (input.value != document.getElementById('password').value) {
            input.setCustomValidity('Passwords must be the same');
        } else {
            // input is valid -- reset the error message
            input.setCustomValidity('');
        }
}