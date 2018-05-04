(function () {
    "use strict";
    var user;

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        // Obsługa zdarzeń wstrzymywania i wznawiania działania oprogramowania Cordova
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener('resume', onResume.bind(this), false);
        initializeFirebase();
        onLogin();
        bindEvents();
        initMenus();
    };

    function initMenus() {
        $('.menu').click(function () {
            $('.menu-hide').toggleClass('show');
            $('.menu').toggleClass('active');
            $('html').toggleClass('menu-active');
        });
        $('a').click(function () {
            $('.menu-hide').removeClass('show');
            $('.menu').removeClass('active');
            $('html').removeClass('menu-active');
        });

        var c = document.querySelector('.card'),
            switchers = c.querySelectorAll('.switch');

        for (var i = 0; i < switchers.length; i++) {
            switchers[i].addEventListener('click', function () {
                c.classList.toggle('flipped');
            }, false);
        }


        $('.restaurantlist li:even').css('background-color', '#f2f2f2');
        $('.restaurantlist li:odd').css('background-color', 'inherit');

    }

    function userLoggedInHandler() {
        $.mobile.changePage("#home");
        console.log(user);
        if (user.displayName) {
            $('.nazwaUzytkownika').html(user.displayName);
        } else { 
            $('.nazwaUzytkownika').html(user.email);
        }
    }

    function onLogin() {
        firebase.auth().onAuthStateChanged(function (firebaseUser) {
            if (firebaseUser) { 
                if (!user) {
                    user = firebase.auth().currentUser;
                }
                userLoggedInHandler();
            } else {
                user = firebase.auth().currentUser;
                if (!user) {
                    $.mobile.changePage("#login");
                } else {
                    userLoggedInHandler();
                }
                //console.log("notLoggedIn:"); 
                //console.log("firebaseUser:");
                //console.log(firebaseUser);
                //console.log("user:");
                //console.log(user);
            }

        });
    }

    function bindEvents() {
        //===== membeship events =====
        $('#sign-in-google').on("click", authWithGoogle);
        $('#sign-in-email').on("click", authWithEmail);
        $('#sign-in-facebook').on("click", authWithFacebook);
        $('#log-in-email').on("click", loginWithEmailEvt);
        $('.logout').on("click", logout); 
    }

    function logout() {
        firebase.auth().signOut().then(function () {
            // Sign-out successful.
            user = null;
            console.log("Log out successfull");
        })
        .catch(function (error) { 
            console.log("Error during logout");
            handleErrorWithAlert(error);
        });
    }

    function initializeFirebase() {
        // Initialize Firebase
        var fireBaseConfig = {
            apiKey: "AIzaSyAN9Ux8Z0TANV8CjbX3aDplBk46ueioeEc",
            authDomain: "eatandshare-27eec.firebaseapp.com",
            databaseURL: "https://eatandshare-27eec.firebaseio.com",
            projectId: "eatandshare-27eec",
            storageBucket: "eatandshare-27eec.appspot.com",
            messagingSenderId: "1031494816944"
        };
        firebase.initializeApp(fireBaseConfig);
        console.log("Firebase app is initialized");
    }

    function authWithGoogle() { 
        var provider = new firebase.auth.GoogleAuthProvider();
        authUsingProvider(provider);
    }

    function authWithFacebook() {
        var provider = new firebase.auth.FacebookAuthProvider();
        authUsingProviderPopUp(provider);
    }

    function authUsingProvider(providerToAuth) {
        firebase.auth().signInWithRedirect(providerToAuth).then(function () {
            return firebase.auth().getRedirectResult();
        }).then(function (result) {
            // This gives you a Google Access Token.
            // You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            user = result.user;
            // ...
            }).catch(handleErrorWithAlert); 
    }

    function authUsingProviderPopUp(providerToAuth) {
        firebase.auth().signInWithPopup(providerToAuth).then(function (result) { 
            // This gives you a Google Access Token.
            // You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            user = result.user;
            // ...
        }).catch(handleErrorWithAlert);
    }

    function authWithEmail() { 
        var usrEmail = document.getElementById('singinEmailField').value;
        var usrPassword = document.getElementById('singinPasswordField').value;
        var usrPassword2 = document.getElementById('singinPasswordField2').value;
        if (usrPassword != usrPassword2) {
            alert("Hasła się nie zgadzają");
            return;
        } else {
            firebase.auth().createUserWithEmailAndPassword(usrEmail, usrPassword)
                .catch(handleErrorWithAlert);
        }
    }

    function loginWithEmailEvt() {
        var usrEmail = $('#loginField').val();
        var usrPassword = $('#passwordField').val();
        console.log(usrEmail + "_" + usrPassword);
        console.log(usrEmail );
        console.log(usrPassword);

        loginWithEmail(usrEmail, usrPassword);
    }
    function loginWithEmail(email, password) {
        firebase.auth().signInWithEmailAndPassword(email, password)
            .catch(handleErrorWithAlert);
    }

    function handleErrorWithAlert(error) {
        console.log("error");
        console.log(error);
        alert(error.message);

    }

    function onPause() {
        // TODO: Ta aplikacja została zawieszona, Zapisz tutaj stan aplikacji.
    };

    function onResume() {
        // TODO: Ta aplikacja została ponownie aktywowana. Przywróć tutaj stan aplikacji.
    };
} )();
