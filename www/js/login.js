(function($){
    $(function(){
        loginSwap();
        $('#loginButton').click(loginFunction);
        $('#registerButton').click(registerFunction);
    }); // end of document ready
})(jQuery); // end of jQuery name space

const herokuUrl = "https://apilergens.herokuapp.com";

function loginSwap(){
    const signUpButton = $('#signUp');
    const signInButton = $('#signIn');
    const container = $('#container');

    signUpButton.click(function(){
        container.addClass("right-panel-active");
    });

    signInButton.click(function(){
        container.removeClass("right-panel-active");
    });
}

function loginFunction(){
    var logEmail = $('#logEmail').val();
    var logPassword = $('#logPassword').val();

    logApiCall(logEmail, logPassword);
}

function registerFunction(){
    var name = $('#name').val();
    var surname1 = $('#surname1').val();
    var surname2 = $('#surname2').val();
    var regEmail = $('#regEmail').val();
    var dni = $('#dni').val();
    var phone = $('#phone').val();
    var regPassword = $('#regPassword').val();

    if(name!=""&&surname1!=""&&surname2!=""&&regEmail!=""&&dni!=""&&phone!=""&&regPassword!=""){
        var newUser = JSON.parse('{"name":"'+name+'","surname1":"'+surname1+'","surname2":"'+surname2+'","dni":"'+dni+'","phone":"'+phone+'","password":"'+regPassword+'","email":"'+regEmail+'"}');
        console.log(newUser);
        regApiCall(newUser);
    } else {
        alert("Campos vacios!");
    }
}

function logApiCall(logEmail, logPass){
    console.log(logEmail+"          "+logPass);
    $.ajax({
        method: "POST",
        url: herokuUrl+"/login",
        data:{
            "user" :{
                "email" : '"'+logEmail+'"',
                "password" : '"'+logPass+'"'
            }
        }
      }).done(function (msg) {
          alert("LOGIN correctamente");
      }).fail(function (data) {
          alert("No se ha encontrado el usuario");
      });
}

function regApiCall(user){
    $.ajax({
        method: "POST",
        url: herokuUrl+"/register",
        data:{
            "user" : {
                "name": user.name,
                "surname1":user.surname1,
                "surname2":user.surname2,
                "dni":user.dni,
                "phone":user.phone,
                "password":user.password,
                "email":user.email,
                "allergies": [{
                    "ID": null,
                    "Type": ""
                }],
                "favourites": [{
                    "id": null
                }]
            }
        }
      }).done(function (msg) {
          alert("REGISTER correcto");
      }).fail(function (data) {
          console.log(data);
      });
}