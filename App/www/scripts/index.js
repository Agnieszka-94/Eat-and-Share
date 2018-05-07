"use strict";
var user = null;
var marker = null;
var showMeThewayMap = null;

 
function onDeviceReady() {
    // Obsługa zdarzeń wstrzymywania i wznawiania działania oprogramowania Cordova
    document.addEventListener('pause', onPause.bind(this), false);
    document.addEventListener('resume', onResume.bind(this), false);
    initializeFirebase();
    onLogin();
    bindEvents();
    $(document).ready(initMenus); 
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
    hideMenusFromLoggedOutUser();
}

function hideMenusFromLoggedOutUser() {
    $('.onlyLoggedIn').hide();
}
function showMenusOnLogin() {
    $('.onlyLoggedIn').show();

}

   function userLoggedInHandler() {
        $.mobile.changePage("#home");
        console.log(user);
        if (user.displayName) {
            $('.nazwaUzytkownika').html(user.displayName);
        } else {
            $('.nazwaUzytkownika').html(user.email);
        }
        if (user && user.uid) {
            generateNewFavoritesList();
            generateNewToVisitList();

        }
        getAllRestaurants($('#range-7a').val(), $('#range-7b').val());
        showMenusOnLogin();
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
                hideMenusFromLoggedOutUser();
            }

        });
    }

    function bindEvents() {
        //===== membeship events =====
        $('#sign-in-google').on("click", authWithGoogle);
        $('#sign-in-email').on("click", authWithEmail);
        $('#sign-in-facebook').on("click", authWithFacebook);
        $('#log-in-email').on("click", loginWithEmailEvt);
        $('#add-restaurant').on("click", handleAddingRestaurant);
        $('.logout').on("click", logout);
        $('#range-7a').on("change", onRangeChange);
        $('#range-7b').on("change", onRangeChange);
        initGoogleMapForRestaurant("addrestaurantmap");
        initGoogleMapForShowMeTheWay("show-way-map");
        $("#wyszukajButton").on("click", handleWyszukaj);
        if (user && user.uid) {
            generateNewFavoritesList();
            generateNewToVisitList();
        }
        getAllRestaurants($('#range-7a').val(), $('#range-7b').val());
        $('#addPrice').on("click", handleAddPrice);

    }

    function initializeFirebase() {
        // Initialize Firebase
        var fireBaseConfig = {
            apiKey: "AIzaSyDNWozPUhxIliBM1SAvTzYq7VBEsHFaxfQ",
            authDomain: "eatandshare-949f6.firebaseapp.com",
            databaseURL: "https://eatandshare-949f6.firebaseio.com",
            projectId: "eatandshare-949f6",
            storageBucket: "eatandshare-949f6.appspot.com",
            messagingSenderId: "600727315534"
        };
        firebase.initializeApp(fireBaseConfig);
        console.log("Firebase app is initialized");
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
            clearSignInForm();
        }
    }

    function clearSignInForm() {
        $('#singinEmailField').val("");
        $('#singinPasswordField').val("");
        $('#singinPasswordField2').val("");
    }

    function loginWithEmailEvt() {
        var usrEmail = $('#loginField').val();
        var usrPassword = $('#passwordField').val();
        console.log(usrEmail + "_" + usrPassword);
        console.log(usrEmail);
        console.log(usrPassword);

        loginWithEmail(usrEmail, usrPassword);
    }

    function loginWithEmail(email, password) {
        firebase.auth().signInWithEmailAndPassword(email, password)
            .catch(handleErrorWithAlert);
    }

    function clearLogInForm() {
        $('#loginField').val("");
        $('#passwordField').val("");
    }

    function handleErrorWithAlert(error) {
        console.log("error");
        console.log(error);
        alert(error.message);

    }

    function handleErrorWithoutAlert(error) {
        console.log("error");
        console.log(error); 
    }

    //#region adding restaurant
    function initGoogleMapForRestaurant(id) {
        var currentLocation = getCurrentLocation();
        var map_canvas = document.getElementById(id);
        var map_options = {
            center: new google.maps.LatLng(currentLocation.latitude, currentLocation.longtitude),
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        var map = new google.maps.Map(map_canvas, map_options); 
        google.maps.event.addListener(map, 'click', function (event) {
            if (marker) {
                deleteMarker();
            }
            placeMarker(event.latLng, map);
        });
    }

    function addRestaurant(name, price, localization) {
        var database = firebase.database();
        var ref = database.ref('Lokale');
        var restaurant = {
            nazwa: name,
            lokalizacja: localization,
            cena: Number(price),
            ulubione: null,
            chceodwiedzic: null
        };

        ref.push(restaurant);
        $.mobile.changePage("#home");
        clearAddRestaurantForm();
    }

    function handleWyszukaj() { 
        getAllRestaurants($('#range-7a').val(), $('#range-7b').val());
    }

    function clearAddRestaurantForm() {
        $(".priceAddRestaurant").val('');
        $("#addname").val('');
        deleteMarker();
    }

    function handleAddingRestaurant() {
        if (marker) {
            var localization = marker.position.lat() + "," + marker.position.lng();
            var price = $(".priceAddRestaurant").val();
            var name = $("#addname").val();
            addRestaurant(name, price, localization);
            loadrestaurantsToPriceSelector();
        }
    }

    function deleteMarker() {
        marker.setMap(null);
        marker = null;
    }

    function placeMarker(location, map) {
        marker = new google.maps.Marker({
            position: location,
            map: map
        });
    }

    function getMap(id) {
        var mapCanvas = $('#' + id);
        console.log(mapCanvas);
        var map = mapCanvas.data("map");
        console.log(map);
        if (map) {
            return map;
        }
    }
    //#endregion adding restaurant

    //#region getting restaurant by price
    function getAllRestaurants(priceFrom, priceTo) {
        var database = firebase.database();
        console.log("laduje lokale");
        var ref = database.ref('Lokale/');
        $('#restaurantListHome').html("");
        if (!priceTo) {
            priceTo = $('#range-7b').val();
            if (!priceTo) {
                priceTo = 100;
            }
        }
        if (!priceFrom) {
            priceFrom = $('#range-7a').val();
            if (!priceFrom) {
                priceFrom = 0;
            }
        }

        ref.orderByChild("cena").on("child_added", function (snapshot) { 
            if (snapshot.val().cena >= Number(priceFrom) && snapshot.val().cena <= Number(priceTo)) {
                var reustaurantToShow = {
                    key: snapshot.key,
                    cena: snapshot.val().cena,
                    nazwa: snapshot.val().nazwa,
                    lokalizacja: snapshot.val().lokalizacja
                };
                generateIndexOfRestaurants(reustaurantToShow);
            }
        });
    }

    function generateIndexOfRestaurants(reustaurantToShow) {
        var html = '<li class="restaurant"><div><h4 id= "nazwalokalu">' + reustaurantToShow.nazwa + '</h4>';
        html += '<p id="cena">' + reustaurantToShow.cena + " zł </p>";
        html += '<a class="showmetheway" data-localization="' + reustaurantToShow.lokalizacja
            + '"><img id="arrow-right" data-localization="' + reustaurantToShow.lokalizacja+'" src="image/Arrow-Right.png"></a>'
            + '<p id="dodaj" > Dodaj lokal do:</p><div class="smallbtns-container">'
            + '<button data-id="' + reustaurantToShow.key
            + '" class="smallbtn addTofavorites ui-shadow ui-btn ui-corner-all ui-btn-inline">Ulubione</button>'
            + '<button data-id="' + reustaurantToShow.key +
            '"class="smallbtn addToVisit ui-shadow ui-btn ui-corner-all ui-btn-inline">Chcę odwiedzić</button></div>'
            + '</div></li>';
        $('#restaurantListHome').append(html);
        $('.showmetheway').off();
        $('.addTofavorites').off();
        $('.addToVisit').off();
        $('.showmetheway').on("click", handleShowMeTheWayButton);
        $('.addToVisit').on("click", handleAddToVisit);
    }

    function onRangeChange() {
        getAllRestaurants($('#range-7a').val(), $('#range-7b').val());
    }
    //#endregion getting restaurant by price

    //#region showmetheway
    function handleShowMeTheWayButton(event) {
        var location = $(event.target).attr("data-localization");
        var locationStart = getCurrentLocation(); 
        location = location.split(',');
        location = {
            latitude: Number(location[0]),
            longtitude: Number(location[1])
        };
        $("show-way-map").html("");
        initGoogleMapForShowMeTheWay("show-way-map"); 
        displayRoute(locationStart, location);
        $.mobile.changePage("#showmetheway");
    }

    function initGoogleMapForShowMeTheWay(id) {
        var currentLocation = getCurrentLocation();
        var map_canvas = document.getElementById(id);
        var map_options = {
            center: new google.maps.LatLng(currentLocation.latitude, currentLocation.longtitude),
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        showMeThewayMap = new google.maps.Map(map_canvas, map_options); 
    }

    function getCurrentLocation() {
        var location = null;
        var options = {
            enableHighAccuracy: true,
            maximumAge: 3600000
        }

        navigator.geolocation.getCurrentPosition(function (position) {
            location = position.coords;
        }, handleErrorWithoutAlert, options);

        if (location) {
            return location;
        }
        return {
            latitude: 50.0530682,
            longtitude: 19.9564987
        };
    } 
    function clearRoutes(directionsDisplay) {
        //it wasn't working for me 
        if (directionsDisplay) {
            directionsDisplay.setMap(null);
            directionsDisplay.setPanel(null);
            directionsDisplay.set('directions', null);
            directionsDisplay.setDirections({ routes: [] });
            directionsDisplay = null;
            directionsDisplay = new google.maps.DirectionsRenderer();
        }
    }
    function displayRoute(startLoc, endLocation) {
        var directionsDisplay = new google.maps.DirectionsRenderer();
        clearRoutes(directionsDisplay);
        var start = new google.maps.LatLng(startLoc.latitude, startLoc.longtitude);
        var end = new google.maps.LatLng(endLocation.latitude, endLocation.longtitude);

        // also, constructor can get "DirectionsRendererOptions" object
        directionsDisplay.setMap(showMeThewayMap); // map should be already initialized.

        var request = {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING
        };
        var directionsService = new google.maps.DirectionsService();
        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            }
        });
    }

    //#endregion showmetheway

    //#region accountfav

    function handleAddToFavorites(event) {
        if (user && user.uid) {
            var keyOfProduct = $(event.target).attr("data-id");
            if (isAlreadyFavorite(keyOfProduct)) {
                console.log("returned");
                return;
            }
            var uid = user.uid;
            var database = firebase.database();
            var ref = database.ref('Lokale/' + keyOfProduct + "/ulubione");
            var polubienie = { uid: uid };
            console.log("push");
            ref.push(polubienie);
            generateNewFavoritesList()
        }
    }

    function isAlreadyFavorite(productKey) {
        var favorites = getAllFavorites();
        for (var i = 0; i < favorites.length; i++) {
            if (favorites[i].key == productKey) {
                return true;
            } 
        }
        return false;
    }
     
    function getAllFavorites() {
        var favorites = [];
        var database = firebase.database();
        var ref = database.ref('Lokale/');
        ref.orderByChild("cena").on("child_added", function (snapshot) {
            if (snapshot.val().ulubione) { 
                    for (var ulub in snapshot.val().ulubione) { 
                        if (snapshot.val().ulubione[ulub].uid == user.uid) {
                            console.log("favorite3", snapshot.val().ulubione[ulub]);
                            favorites.push({
                                key: snapshot.key,
                                cena: snapshot.val().cena,
                                nazwa: snapshot.val().nazwa,
                                lokalizacja: snapshot.val().lokalizacja
                            });
                        }
                    }
                }
        })
        return favorites;

    }

    function handleDeleteFromFavorites(event) {
        var keyOfProduct = $(event.target).attr("data-id");
        if (!isAlreadyFavorite(keyOfProduct)) {
            return;
        }
        var database = firebase.database();
        var ref = database.ref('Lokale/' + keyOfProduct);
        var ulub = null;
        var ulubToUpdate = null;
        ref.on("child_added", function (snapshot) {
            if (snapshot.key=="ulubione") { 
                ulub = snapshot.val()
            } 
        });

        if (ulub) {
            for (var favorite in ulub) {
                if (ulub[favorite].uid != user.uid) {
                    //copying other users with exception of current user
                    ulubToUpdate[favorite] = ulub[favorite];
                }
            }

            ref.update({
                "ulubione": ulubToUpdate
            });
            generateNewFavoritesList();
        }

    }
    function generateNewFavoritesList() {
        console.log("generating newlist");
        var fav = getAllFavorites();
        $('#favoriteRestaurantList').html("");
        var database = firebase.database();
        var ref = database.ref('Lokale/');
        ref.orderByChild("cena").on("child_added", function (snapshot) {
            if (snapshot.val().ulubione) {
                for (var ulub in snapshot.val().ulubione) {
                    if (snapshot.val().ulubione[ulub].uid == user.uid) {
                        console.log("favorite3", snapshot.val().ulubione[ulub]);
                        generateIndexOfFavoriteRestaurants({
                            key: snapshot.key,
                            cena: snapshot.val().cena,
                            nazwa: snapshot.val().nazwa,
                            lokalizacja: snapshot.val().lokalizacja
                        });
                    }
                }
            }
        })
    }
    function generateIndexOfFavoriteRestaurants(reustaurantToShow) {
        var html = '<li class="restaurant"><div><h4 id= "nazwalokalu">' + reustaurantToShow.nazwa + '</h4>';
        html += '<p id="cena">' + reustaurantToShow.cena + " zł </p>";
        html += '<a class="showmetheway" data-localization="' + reustaurantToShow.lokalizacja
            + '"><img id="arrow-right" data-localization="' + reustaurantToShow.lokalizacja + '" src="image/Arrow-Right.png"></a>'
            + '<p id="dodaj" ></p><div class="smallbtns-container">' 
            + '<button data-id="' + reustaurantToShow.key +
            '"class="smallbtn ui-shadow deleteFromFavorites ui-btn ui-corner-all ui-btn-inline">Usuń z ulubionych</button></div>'
            + '</div></li>';
        $('#favoriteRestaurantList').append(html);
        $('.showmetheway').off();
        $('.deleteFromFavorites').off();
        $('.showmetheway').on("click", handleShowMeTheWayButton);
        $('.deleteFromFavorites').on("click", handleDeleteFromFavorites);
    }
    //#endregion accountfav

    //#region accountvisit

    function handleAddToVisit(event) {
        if (user && user.uid) {
        var keyOfProduct = $(event.target).attr("data-id");
        if (isAlreadyToVisit(keyOfProduct)) {
            console.log("returned");
            return;
        }
        var uid = user.uid;
        var database = firebase.database();
        var ref = database.ref('Lokale/' + keyOfProduct + "/chceodwiedzic");
        var polubienie = { uid: uid };
        console.log("push");
        ref.push(polubienie);
        generateNewToVisitList()
        }
    }

    function isAlreadyToVisit(productKey) {
        var toVisit = getAllToVisit();
        for (var i = 0; i < toVisit.length; i++) {
            if (toVisit[i].key == productKey) {
                return true;
            }
        }
        return false;
    }

    function getAllToVisit() {
        var toVisit = [];
        var database = firebase.database();
        var ref = database.ref('Lokale/');
        ref.orderByChild("cena").on("child_added", function (snapshot) {
            if (snapshot.val().chceodwiedzic) {
                for (var ulub in snapshot.val().chceodwiedzic) {
                    if (snapshot.val().chceodwiedzic[ulub].uid == user.uid) {
                        console.log("chceodwiedzic", snapshot.val().chceodwiedzic[ulub]);
                        toVisit.push({
                            key: snapshot.key,
                            cena: snapshot.val().cena,
                            nazwa: snapshot.val().nazwa,
                            lokalizacja: snapshot.val().lokalizacja
                        });
                    }
                }
            }
        })
        return toVisit;

    }

    function handleDeleteFromToVisit(event) {
        var keyOfProduct = $(event.target).attr("data-id");
        if (!isAlreadyToVisit(keyOfProduct)) {
            return;
        }
        var database = firebase.database();
        var ref = database.ref('Lokale/' + keyOfProduct);
        var ulub = null;
        var ulubToUpdate = null;
        ref.on("child_added", function (snapshot) {
            if (snapshot.key == "chceodwiedzic") {
                ulub = snapshot.val()
            }
        });

        if (ulub) {
            for (var favorite in ulub) {
                if (ulub[favorite].uid != user.uid) {
                    //copying other users with exception of current user
                    ulubToUpdate[favorite] = ulub[favorite];
                }
            }

            ref.update({
                "chceodwiedzic": ulubToUpdate
            });
            generateNewToVisitList();
        }

    }
    function generateNewToVisitList() {
        console.log("generating newlist");
        var fav = getAllToVisit();
        $('#toVisitRestaurantList').html("");
        var database = firebase.database();
        var ref = database.ref('Lokale/');
        ref.orderByChild("cena").on("child_added", function (snapshot) {
            if (snapshot.val().chceodwiedzic) {
                for (var ulub in snapshot.val().chceodwiedzic) {
                    if (snapshot.val().chceodwiedzic[ulub].uid == user.uid) {
                        console.log("chceodwiedzic", snapshot.val().chceodwiedzic[ulub]);
                        generateIndexOfToVisitRestaurants({
                            key: snapshot.key,
                            cena: snapshot.val().cena,
                            nazwa: snapshot.val().nazwa,
                            lokalizacja: snapshot.val().lokalizacja
                        });
                    }
                }
            }
        })
    }
    function generateIndexOfToVisitRestaurants(reustaurantToShow) {
        var html = '<li class="restaurant"><div><h4 id= "nazwalokalu">' + reustaurantToShow.nazwa + '</h4>';
        html += '<p id="cena">' + reustaurantToShow.cena + " zł </p>";
        html += '<a class="showmetheway" data-localization="' + reustaurantToShow.lokalizacja
            + '"><img id="arrow-right" data-localization="' + reustaurantToShow.lokalizacja + '" src="image/Arrow-Right.png"></a>'
            + '<p id="dodaj" ></p><div class="smallbtns-container">'
            + '<button data-id="' + reustaurantToShow.key +
            '"class="smallbtn ui-shadow deleteFromToVisit ui-btn ui-corner-all ui-btn-inline">Usuń z chcę odwiedzic</button></div>'
            + '</div></li>';
        $('#toVisitRestaurantList').append(html);
        $('.showmetheway').off();
        $('.deleteFromToVisit').off();
        $('.showmetheway').on("click", handleShowMeTheWayButton);
        $('.deleteFromToVisit').on("click", handleDeleteFromToVisit);
    }
    //#endregion accountfav

    //#region prices
    function loadrestaurantsToPriceSelector() {
        var database = firebase.database();
        var ref = database.ref('Lokale/');
        $('#select-choice-1').html("");
        ref.orderByChild("nazwa").on("child_added", function (snapshot) {
            $('#select-choice-1').append('<option value="' + snapshot.key + '">' + snapshot.val().nazwa + '</option>');
        });
    }

    function handleAddPrice() {
        var database = firebase.database();
        var selectedRestaurant = $("#select-choice-1").val();
        var priceToAdd = ("#pricetoadd").val();
        var ref = database.ref('Lokale/' + keyOfProduct);
        if (priceToAdd && !isNaN(priceToAdd)) {
            ref.update({
                "cena": Number(priceToAdd)
            });   
        }     
        clearPriceForm();
        getAllRestaurants($('#range-7a').val(), $('#range-7b').val());
    }
    function clearPriceForm() {
        var priceToAdd = ("#pricetoadd").val("");
    }

    //#region prices

    function onPause() {
        // TODO: Ta aplikacja została zawieszona, Zapisz tutaj stan aplikacji.
    };

    function onResume() {
        // TODO: Ta aplikacja została ponownie aktywowana. Przywróć tutaj stan aplikacji.
    };
