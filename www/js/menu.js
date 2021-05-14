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

const herokuUrl = "https://apilergens.herokuapp.com";
//const herokuUrl = "http://localhost:5000";

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

    popupPasswordListener()
    
    $('#profileData').append('<li> User: '+userData.name+'</li>');
    $('#profileData').append('<li> Email: '+userData.email+'</li>');
    $('#profileData').append('<button id="btnPassword">Change Password</button>');
    $('#btnPassword').on("click", function(){
        
        popupPasswordListener()
        console.log("El Cambio")
    });
    


}

function favouritesCall(){

    $.ajax({
        method: "POST",
        url: herokuUrl+"/restaurants/getById",
        data:{
            "favourites":userData.favourites
          }
      }).done(function (favs) {
          favouritesRes = favs;
          fullFavourites(userData);
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

async function ingredientsCall(ingredientIds, restaurant, i){

    $.ajax({
        method: "POST",
        url: herokuUrl+"/ingredients/getByListId",
        data:{
            "ingredients":ingredientIds
          }
      }).done(function (ingr) {
            var namesString = "";

            var allergy = false
            stringClass = 'fas fa-times'

          for (let y = 0; y < ingr.length; y++) {

            console.log("Ingr = "+ingr[y].allergen)

            console.log("allergies = " + userData.allergies[y])

            if(y == ingr.length - 1){
                namesString += ingr[y].name + ". ";
              } else {
                namesString += ingr[y].name + ", ";
              }

                for (let z = 0; z < userData.allergies; z++) {

                    console.log("Allergy = " + userData.allergies[z])

                    if (ingr[y].allergen == userData.allergies[z]) {
    
                        allergy = true;
    
                        stringClass = 'fas fa-check'

                        break;
    
                    }
    
                }

              
          }
            
         appendIngredient(restaurant, i, namesString, stringClass);

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

    $('#restaurantDishes').empty();
    $('#restaurantName').empty().append("<h2>"+restaurant.name.toUpperCase()+"</i><span id='"+restaurant._id+"' class='fa fa-star'></span></h2>");

    $('#'+restaurant._id).on('click', function() {
        this.classList.toggle("checked");
    });

    /*
        Dentro del for habrá que hacer control de alergenos y añadir class="fas fa-times" (X) o class='fas fa-check' (tick)
        <i class=''>
    */ 
    for (let i = 0; i < restaurant.dishes.length; i++) {
        
        ingredientsCall(restaurant.dishes[i].ingredients, restaurant, i);
        
    }
}

// Fill in function for favourites restaurants div
function fullFavourites(user){
    
    for (let i = 0; i < user.favourites.length; i++) {
        $('#favouritesRes').append("<button id='acordion"+i+"' class='accordion'>"+favouritesRes[i].name.toUpperCase()+"</button><div id='acordionPanel' class='panel'><p><strong>Calle: </strong>"+favouritesRes[i].address+"</p><p><strong>Telefono: </strong>"+favouritesRes[i].phone+"</p><button id='"+favouritesRes[i].name.replaceAll(" ","_")+"' class='see-dishes-Btn'>Ver carta</button></div>");

        popupListener(favouritesRes[i].name.replaceAll(" ","_"), favouritesRes[i]);

        accordionListener("acordion"+i)
    }
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

function appendIngredient(restaurant, i, namesString, stringClass) {

    $('#restaurantDishes').append("<button id='"+restaurant.dishes[i].name.replaceAll(" ", "_")+"' class='accordion "+stringClass+"'>"+restaurant.dishes[i].name+"</button><div id='acordionPanel' class='panel'><p font-size='10px'><strong>Ingredients: </strong>"+namesString+"</p></div>");
    accordionListener(restaurant.dishes[i].name.replaceAll(" ", "_"));

}