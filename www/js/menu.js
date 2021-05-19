(function($){
    $(function(){
        // Saludo personalizado
        helloText();
        // GetAll Allergens
        allergensCall();
        // Listeners para ver tab activo
        activeTab();
        navListeners();
        $('#home').addClass("focus");
        $('#profileTab').hide();

        $('#srcBtn').on("click", srcRestaurant);
        
    }); // end of document ready
})(jQuery); // end of jQuery name space

// VARIABLES GLOBALES =========================================

const herokuUrl = "https://apilergens.herokuapp.com";
// const herokuUrl = "http://localhost:5000";

var userData = "", favouritesRes = "", ingNames = "", allAllergens = "", selectedAllergens = []
userAllergens = [];

// ==============================================================

function helloText(){

    var email = localStorage.getItem('email');

    $.ajax({
        method: "GET",
        url: herokuUrl+"/users/getByEmail?email="+email,
        dataType: "json"
      }).done(function (user) {
        userData = user;
        $('#nameHeader').append('<label> Hola, '+user.name+'!</label>');
        profileData()
        // Recuperar restaurantes favoritos
        favouritesCall();
      }).fail(function (data) {
          alert("Error al encontrar usuario");
      });
}

function allergensCall(){

    $.ajax({
        method: "GET",
        url: herokuUrl+"/allergens/getAll",
        dataType: "json"
      }).done(function (allergens) {
        allAllergens = allergens;
      }).fail(function (data) {
          alert("Error al encontrar alérgenos");
      });
}

function favouritesCall(){

    if(userData.favourites == null){

    } else {
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

        userData.favourites = newFavs

        favouritesCall()

        alert("Favourites updated");

      }).fail(function (data) {
          console.log(data);
      });

}

function changePassword(pass1, pass2){

    email = userData.email
    password1 = pass1
    password2 = pass2

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

          $('.overlayPass').removeClass('active');
          $('.popupPass').removeClass('active');

      }).fail(function (data) {
          console.log(data);
      });

}

function setAllergies(){

    email = userData.email

    $.ajax({
        method: "POST",
        url: herokuUrl+"/user/setAllergens",
        data:
            {
                "email": email,
                "allergens": selectedAllergens
            }
      }).done(function (msg) {
          userData.allergies = "";
          userData.allergies = msg;

          alert("Alérgenos modificados correctamente");

          $('#overlayAll').removeClass('active');
          $('#popupAll').removeClass('active');
      }).fail(function (data) {
          console.log(data);
      });

}

function profileData(){   
    
    $('#userDataTable').append('<tr><td><b>Nombre: </td><td>'+userData.name+'</td></tr>');
    $('#userDataTable').append('<tr><td><b>Primer Apellido: </td><td>'+userData.surname1+'</td></tr>');
    $('#userDataTable').append('<tr><td><b>Segundo Apellido: </td><td>'+userData.surname2+'</td></tr>');
    $('#userDataTable').append('<tr><td><b>Email: </td><td>'+userData.email+'</td></tr>');
    $('#userDataTable').append('<tr><td><b>Telefono: </td><td>'+userData.phone+'</td></tr>');
    $('#userDataTable').append('<tr><td><b>Cambiar contraseña: </td><td><button id="btnPassword">Cambiar contraseña</button></td></tr>');
    $('#userDataTable').append('<tr><td><b>Cambiar alergias: </td><td><button id="changeAllergiesBtn">Cambiar alergias</button></td></tr>');


    popupProfileListener("btnPassword");
    popupProfileListener("changeAllergiesBtn");

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
        $('#nameHeader').append('<label> PERFIL </label>');
        $('#home').removeClass("focus");
        $('#profile').addClass("focus");

        // Close Popup at window change
        $('.overlay').removeClass('active');
        $('.overlayPass').removeClass('active');
        $('.popup').removeClass('active');
        $('.popupPass').removeClass('active');
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
    $('#restaurantSearchDiv').append("<button id='acordion' class='accordion'>"+name.toUpperCase()+" ("+restaurant.code+") "+"</button><div id='acordionPanel' class='panel'><p><strong>Calle: </strong>"+restaurant.address+"</p><p><strong>Telefono: </strong>"+restaurant.phone+"</p><button id='"+resName.replaceAll(" ", "_")+"' class='see-dishes-Btn' >Ver carta</button></div>");

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
function popupProfileListener(openBtn){

    var btnOpenPopup = $('#'+openBtn);
    var btnClosePopup = $('.btn-close-popup');
    if(openBtn=="btnPassword"){
        var overlay = $('.overlayPass');
        var popup = $('.popupPass');
    } else {
        var overlay = $('#overlayAll');
        var popup = $('#popupAll');
    }

    btnOpenPopup.on("click", function(){
        overlay.addClass('active');
        popup.addClass('active');
        if(openBtn=="btnPassword"){fillInChangePassword();} else {fillInChangeAllergens(allAllergens);}
    });

    btnClosePopup.on("click", function(){
        overlay.removeClass('active');
        popup.removeClass('active');
    });
}

function fillInChangePassword(){
    $('#container').empty();
    $('#container').append('<label>Contraseña antigua: </label><Input type="password" id="oldPassword">');
    $('#container').append('<label>Contraseña nueva: </label><Input type="password" id="newPassword">');
    $('#container').append('<button id="changePass" style="margin-top:10px; font-size:16px;">Cambiar contraseña</button>');
    $('#changePass').on('click', function(){
        if($('#oldPassword').val() != "" && $('#newPassword').val() != "" && $('#oldPassword').val() != $('#newPassword').val()){
            changePassword($('#oldPassword').val(), $('#newPassword').val());
        } else if ($('#oldPassword').val() == $('#newPassword').val()){
            alert("Las contraseñas no pueden ser iguales!")
        }else {
            alert("Rellenar todos los campos!")
        }
    });
}

function fillInChangeAllergens(allergens){

    $('#allergensTable').empty();
    $('#allergensTable').append("<tr><th>NOMBRE DEL ALÉRGENO</th></tr>");

    var i = 0;
    allergens.forEach(allergen => {
        $('#allergensTable').append("<tr><td id='"+allergen.name.replaceAll(" ","_")+"'>"+allergen.name+"</td><td><input id='"+allergen._id+"' type='checkbox'></td></tr>");

        userData.allergies.forEach(userAllergen =>{
            if(userAllergen == allergen._id){
                $('#'+allergen._id).prop('checked', true);
            }
        });
    
        checkboxListener(allergen._id, i);
        i++;
    });

    $('#allergensTable').append("<tr><td><button id='saveAllergens' style='margin-bottom:40px;'>GUARDAR ALÉRGENOS</button></td><td></td></tr>");

    $('#saveAllergens').on('click', function(){
        if(selectedAllergens.length == 0){
            var opcion = confirm("No se ha seleccionado ningun alérgeno, desea dejarlo vacio?");
            if (opcion == true) {
                setAllergies();
            } else {
                alert("Seleccionar alérgenos");
            }
        } else {
            setAllergies(selectedAllergens);
        }
    });
}

function checkboxListener(id, pos){

    var pos = pos;
    $('#'+id).on( 'change', function() {
        if( $(this).is(':checked') ) {
            selectedAllergens.push(id);
        } else {
            selectedAllergens.splice(pos, 1);
        }
    });

}

// Fill in function for all popups
function fillInRestaurantPopup(restaurant){

    if(userData.favourites != null){
        index = userData.favourites.indexOf(restaurant._id)
    } else {
        index = -1;
    }
    

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
        
    ingredientsCall(restaurant, 0);

}

// Fill in function for favourites restaurants div
function fullFavourites(){
    console.log(favouritesRes);
    if(favouritesRes != null){
        $('#favouritesRes').empty()
    
        for (let i = 0; i < favouritesRes.length; i++) {
    
            $('#favouritesRes').append("<button id='acordion"+i+"' class='accordion'>"+favouritesRes[i].name.toUpperCase()+" ("+favouritesRes[i].code+") "+"</button><div id='acordionPanel' class='panel'><p><strong>Calle: </strong>"+favouritesRes[i].address+"</p><p><strong>Telefono: </strong>"+favouritesRes[i].phone+"</p><button id='"+favouritesRes[i].name.replaceAll(" ","_")+"' class='see-dishes-Btn'>Ver carta</button></div>");
    
            popupListener(favouritesRes[i].name.replaceAll(" ","_"), favouritesRes[i]);
    
            accordionListener("acordion"+i)
        }
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