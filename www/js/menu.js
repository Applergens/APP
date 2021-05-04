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

function helloText(){
    var name = localStorage.getItem('name');
    $('#nameHeader').append('<label> Hola, '+name+'!</label>');
}

function activeTab(){
    $('#home').click(function(){
        $('#profile').removeClass("focus");
        $('#home').addClass("focus");
    });

    $('#profile').click(function(){
        $('#home').removeClass("focus");
        $('#profile').addClass("focus");
    });
}

function navListeners(){
    $('#home').click(function(){
        $('#homeTab').show();
        $('#profileTab').hide();
    });
        
    $('#profile').click(function(){
        $('#homeTab').hide();
        $('#profileTab').show();
    });
}

function srcRestaurant(){
    var code = $('#srcInput').val();
    if(code != ""){
        $.ajax({
            method: "GET",
            url: herokuUrl+"/restaurants/getByCode?code="+code,
            dataType: "json"
          }).done(function (msg) {
              $('#restaurantSearchDiv').empty();
              fullAcordion(msg);
          }).fail(function (data) {
              alert("No se encuentra el codigo");
          });
    } else {
        alert("Introducir codigo");
    }
}

function fullAcordion(restaurant){
    var resName = restaurant.name;
    var name = resName.toUpperCase();
    $('#restaurantSearchDiv').append("<button id='acordion' class='accordion'>"+name+"</button><div id='acordionPanel' class='panel'><p><strong>Calle: </strong>"+restaurant.address+"</p><p><strong>Telefono: </strong>"+restaurant.phone+"</p></div>");

    $('#acordion').on("click",function() {
        /* Toggle between adding and removing the "active" class,
        to highlight the button that controls the panel */
        this.classList.toggle("active");

        var panel=$(this).next(".panel");
			
        if(panel.css("display")=="none"){ //open		
            panel.slideDown(250);			
            $(this).addClass("open");
        }
        else{ //close		
            panel.slideUp(250);
            $(this).removeClass("open");	
        }
    });
}