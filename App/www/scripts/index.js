(function () {
    "use strict";
    var user;

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        // Obs³uga zdarzeñ wstrzymywania i wznawiania dzia³ania oprogramowania Cordova
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
            apiKey: ""
            authDomain: "",
            databaseURL: "",
            projectId: "",
            storageBucket: "",
            messagingSenderId: ""
        };
        firebase.initializeApp(fireBaseConfig);
        console.log("Firebase app is initialized");
    } 
    function handleErrorWithAlert(error) {
        console.log("error");
        console.log(error);
        alert(error.message);

    }

    function onPause() {
        // TODO: Ta aplikacja zosta³a zawieszona, Zapisz tutaj stan aplikacji.
    };

    function onResume() {
        // TODO: Ta aplikacja zosta³a ponownie aktywowana. Przywróæ tutaj stan aplikacji.
    };
} )();