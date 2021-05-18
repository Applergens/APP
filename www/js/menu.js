(function($){
    $(function(){
        // Saludo personalizado
        helloText();
        // Listeners para ver tab activo
        activeTab();
        navListeners();
        $('#home').addClass("focus");
        $('#profileTab').hide();

        $('#srcBtn').on("click", srcRestaurant);
        
    }); // end of document ready
})(jQuery); // end of jQuery name space

// const herokuUrl = "https://apilergens.herokuapp.com";
const herokuUrl = "http://localhost:5000";

var userData = "";
var favouritesRes = "";
var ingNames = "";

function helloText(){

    var email = localStorage.getItem('email');

    $.ajax({
        method: "GET",
        url: herokuUrl+"/users/getByEmail?email="+email,
        dataType: "json"
      }).done(function (user) {
        userData = user;
        console.log(userData)
        $('#nameHeader').append('<label> Hola, '+user.name+'!</label>');
        profileData()
        // Recuperar restaurantes favoritos
        favouritesCall();
      }).fail(function (data) {
          alert("Error al encontrar usuario");
      });
}

function profileData(){   
    
    $('#profileData').append('<li> User: '+userData.name+'</li>');
    $('#profileData').append('<li> Email: '+userData.email+'</li>');
    $('#profileData').append('<button id="btnPassword">Change Password</button>');

    popupPasswordListener()

}

function favouritesCall(){

    $.ajax({
        method: "POST",
        url: herokuUrl+"/restaurants/getByListId",
        data:{
            "favourites":userData.favourites
          }
      }).done(function (favs) {
          favouritesRes = favs;
          fullFavourites();
      }).fail(function (data) {
          console.log(data);
          alert("Something went wrong");
      });

}

function srcRestaurant(){
    var code = $('#srcInput').val();
    if(code != "" || code < 100001){
        $.ajax({
            method: "GET",
            url: herokuUrl+"/restaurants/getByCode?code="+code,
            dataType: "json"
          }).done(function (restaurant) {
              $('#restaurantSearchDiv').empty();
              fullAcordion(restaurant);
          }).fail(function (data) {
              console.log(data);
              alert("No se encuentra el codigo");
          });
    } else {
        alert("Codigo incorrecto");
    }
}

async function ingredientsCall(restaurant, index){
    
    ingredientIds = restaurant.dishes[index].ingredients

    $.ajax({
        method: "POST",
        url: herokuUrl+"/ingredients/getByListId",
        data:{
            "ingredients":ingredientIds
          }
      }).done(function (ingr) {

        var namesString = "";

        allergy = false

        classString = 'fas fa-check'

        for (i = 0; i < ingr.length; i++) {

            if(i == ingr.length - 1){
                namesString += ingr[i].name + ". "
            } else {
                namesString += ingr[i].name + ", "
            }

            if (!allergy) {

                for (j = 0; j < userData.allergies.length; j++) {
    
                    if (ingr[i].allergen == userData.allergies[j]) {

                        allergy = true;
            
                        classString = 'fas fa-times'
    
                        break;
            
                    }
        
                }

            }

        }

        if (allergy) {
         
            console.log("X - Allergic")

        } else {

            console.log("V - Not Allergic")

        }

        $('#restaurantDishes').append("<button id='"+restaurant.dishes[index].name.replaceAll(" ", "_")+"' class='accordion "+classString+"'>"+restaurant.dishes[index].name+"</button><div id='acordionPanel' class='panel'><p font-size='10px'><strong>Ingredients: </strong>"+namesString+"</p></div>");
        accordionListener(restaurant.dishes[index].name.replaceAll(" ", "_"));

        if (restaurant.dishes.length != index+1) {

            ingredientsCall(restaurant, index+1);

        }

      }).fail(function (data) {
          console.log(data);
          alert("Something went wrong")
          return false;
      });

}

function activeTab(){
    $('#home').on("click",function(){
        $('#nameHeader').empty()
        $('#nameHeader').append('<label> Hola, '+userData.name+'!</label>')
        $('#profile').removeClass("focus");
        $('#home').addClass("focus");
    });

    $('#profile').on("click",function(){
        $('#nameHeader').empty()
        $('#nameHeader').append('<label> Tu perfil </label>');
        $('#home').removeClass("focus");
        $('#profile').addClass("focus");
    });
}

function navListeners(){
    $('#home').on("click", function(){
        $('#homeTab').show();
        $('#profileTab').hide();
    });
        
    $('#profile').on("click",function(){
        $('#homeTab').hide();
        $('#profileTab').show();
    });
}

// Search Restaurant accordion
function fullAcordion(restaurant){
    var resName = restaurant.name;
    var name = resName.toUpperCase();
    $('#restaurantSearchDiv').append("<button id='acordion' class='accordion'>"+name.toUpperCase()+"</button><div id='acordionPanel' class='panel'><p><strong>Calle: </strong>"+restaurant.address+"</p><p><strong>Telefono: </strong>"+restaurant.phone+"</p><button id='"+resName.replaceAll(" ", "_")+"' class='see-dishes-Btn' >Ver carta</button></div>");

    popupListener(restaurant.name, restaurant);

    accordionListener("acordion");
}

// Popup listener for all accordions
function popupListener(id, restaurant){
    var name = id.replaceAll(" ", "_");
    var btnOpenPopup = $('#'+name);
    var btnClosePopup = $('#btn-close-popup');
    var overlay = $('.overlay');
    var popup = $('.popup');

    btnOpenPopup.on("click", function(){
        overlay.addClass('active');
        popup.addClass('active');
        fillInRestaurantPopup(restaurant);
    });

    btnClosePopup.on("click", function(){
        overlay.removeClass('active');
        popup.removeClass('active');
    });
}

// Popup Password
function popupPasswordListener(){

    var btnOpenPopup = $('#btnPassword');
    var btnClosePopup = $('#btn-close-popupPassword');
    var overlay = $('.overlay');
    var popup = $('.popupPassword');

    btnOpenPopup.on("click", function(){
        overlay.addClass('active');
        popup.addClass('active');
    });

    btnClosePopup.on("click", function(){
        overlay.removeClass('active');
        popup.removeClass('active');
    });
}

// Fill in function for all popups
async function fillInRestaurantPopup(restaurant){

    index = userData.favourites.indexOf(restaurant._id)

    if (index == -1) {

        classString = "fa fa-star"

    } else {

        classString = "fa fa-star checked"

    }

    $('#restaurantDishes').empty();
    $('#restaurantName').empty().append("<h2>"+restaurant.name.toUpperCase()+"</i><span id='"+restaurant._id+"' class='"+classString+"'></span></h2>");

    $('#'+restaurant._id).on('click', function() {
        this.classList.toggle("checked");

        $('.fa fa-star').prop('disabled', true)
        $('.fa fa-star checked').prop('disabled', true)

        setFavouriteCall(restaurant._id)

    });

    /*
        Dentro del for habrá que hacer control de alergenos y añadir class="fas fa-times" (X) o class='fas fa-check' (tick)
        <i class=''>
    */ 

    console.log('Restaurant name = ' + restaurant.name)
        
    ingredientsCall(restaurant, 0);

}

function setFavouriteCall(restaurantId) {

    $.ajax({
        method: "POST",
        url: herokuUrl+"/user/setFavourite",
        data:
            {
                "email": userData.email,
                "restaurantId": restaurantId,
            }
      }).done(function (newFavs) {

        console.log('New favs length = ' + newFavs.length)

        userData.favourites = newFavs

        favouritesCall()

        alert("Favourites updated");

      }).fail(function (data) {
          console.log(data);
      });

}

// Fill in function for favourites restaurants div
function fullFavourites(){

    $('#favouritesRes').empty()
    
    for (let i = 0; i < favouritesRes.length; i++) {

        console.log('Favourites = ' + favouritesRes[i].name)

        $('#favouritesRes').append("<button id='acordion"+i+"' class='accordion'>"+favouritesRes[i].name.toUpperCase()+"</button><div id='acordionPanel' class='panel'><p><strong>Calle: </strong>"+favouritesRes[i].address+"</p><p><strong>Telefono: </strong>"+favouritesRes[i].phone+"</p><button id='"+favouritesRes[i].name.replaceAll(" ","_")+"' class='see-dishes-Btn'>Ver carta</button></div>");

        popupListener(favouritesRes[i].name.replaceAll(" ","_"), favouritesRes[i]);

        accordionListener("acordion"+i)
    }

    // $('.fa fa-star').prop('disabled', false)
    // $('.fa fa-star checked').prop('disabled', false)
}

// Accordion listener
function accordionListener(name){

    $('#'+name).on("click",function() {
        /* Toggle between adding and removing the "active" class,
        to highlight the button that controls the panel */
        this.classList.toggle("accordionActive");
        this.classList.toggle("active");

        var panel=$(this).next(".panel");
            
        // Open accordion
        if(panel.css("display")=="none"){			
            panel.slideDown(250);		
            $(this).addClass("open");
        }else{ // Close accordion
            panel.slideUp(250);
            $(this).removeClass("open");	
        }
    });
}

function changePassword(){

    email = "amador@gmail.com"
    password1 = "amador"
    password2 = "1234"

    $.ajax({
        method: "POST",
        url: herokuUrl+"/users/changePassword",
        data:
            {
                "email": email,
                "password1": password1,
                "password2": password2
            }
      }).done(function (msg) {

          alert("Password Changed");

      }).fail(function (data) {
          console.log(data);
      });

}