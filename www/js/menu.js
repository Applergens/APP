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

//const herokuUrl = "https://apilergens.herokuapp.com";
const herokuUrl = "http://localhost:5000";

function helloText(){
    var email = localStorage.getItem('email');
    $.ajax({
        method: "GET",
        url: herokuUrl+"/users/getByEmail?email="+email,
        dataType: "json"
      }).done(function (msg) {
        $('#nameHeader').append('<label> Hola, '+msg.name+'!</label>');
        fullFavourites(msg);
      }).fail(function (data) {
          alert("Error al encontrar usuario");
      });
}

function activeTab(){
    $('#home').on("click",function(){
        $('#profile').removeClass("focus");
        $('#home').addClass("focus");
    });

    $('#profile').on("click",function(){
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

function fullAcordion(restaurant){
    var resName = restaurant.name;
    var name = resName.toUpperCase();
    $('#restaurantSearchDiv').append("<button id='acordion' class='accordion'>"+name+"</button><div id='acordionPanel' class='panel'><p><strong>Calle: </strong>"+restaurant.address+"</p><p><strong>Telefono: </strong>"+restaurant.phone+"</p><button id='"+resName.replace(" ", "_")+"'>Ver carta</button></div>");

    popupListener(restaurant.name, restaurant);

    $('#acordion').on("click",function() {
        /* Toggle between adding and removing the "active" class,
        to highlight the button that controls the panel */
        this.classList.toggle("active");

        var panel=$(this).next(".panel");
			
        // Open accordion
        if(panel.css("display")=="none"){		
            panel.slideDown(250);			
            $(this).addClass("open");
        }
        else{ // Close accordion
            panel.slideUp(250);
            $(this).removeClass("open");	
        }
    });
}

function popupListener(id, restaurant){
    var name = id.replace(" ", "_");
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

function fillInRestaurantPopup(restaurant){

    $('#restaurantName').empty().append("<h1>"+restaurant.name.toUpperCase()+"</h1>");
    $('#restaurantDishes').empty()
    for (let i = 0; i < restaurant.dishes.length; i++) {
        $('#restaurantDishes').append(restaurant.dishes[i]+"<br>");
        
    }
    
}

function fullFavourites(user){
    
    for (let i = 0; i < user.favourites.length; i++) {
        $('#favouritesRes').append("<button id='acordion"+i+"' class='accordion'>"+user.favourites[i]+"</button><div id='acordionPanel' class='panel'><p><strong>Calle: </strong></p><p><strong>Telefono: </strong></p><button id='"+user.favourites[i]+"'>Ver carta</button></div>");

        popupListener(user.favourites[i]);

        $('#acordion'+i).on("click",function() {
            /* Toggle between adding and removing the "active" class,
            to highlight the button that controls the panel */
            this.classList.toggle("accordionActive");
    
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
}