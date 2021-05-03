(function($){
    $(function(){
        // Listeners para ver tab activo
        activeTab();
        navListeners();
        $('#home').addClass("active");
        $('#profileTab').hide();

        $('#srcBtn').click(srcRestaurant);
        
    }); // end of document ready
})(jQuery); // end of jQuery name space

const herokuUrl = "https://apilergens.herokuapp.com";

function activeTab(){
    $('#home').click(function(){
        $('#profile').removeClass("active");
        $('#home').addClass("active");
    });

    $('#profile').click(function(){
        $('#home').removeClass("active");
        $('#profile').addClass("active");
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
            url: herokuUrl+"/restaurant/getByCode?code="+code,
            dataType: "json"
          }).done(function (msg) {
              
          }).fail(function (data) {
              alert("El codigo del restaurante no se encuentra");
          });
    } else {
        alert("Introducir codigo");
    }
}