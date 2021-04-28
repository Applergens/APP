(function($){
    $(function(){
        loginSwap();
        $('#registerButton').click(registerFunction);
    }); // end of document ready
})(jQuery); // end of jQuery name space

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

function registerFunction(){
    var name = $('#name').val();
    var surname1 = $('#surname1').val();
    var surname2 = $('#surname2').val();
    var regEmail = $('#regEmail').val();
    var dni = $('#dni').val();
    var phone = $('#phone').val();
    var regPassword = $('#regPassword').val();
    console.log(name);
    if(name!=""&&surname1!=""&&surname2!=""&&regEmail!=""&&dni!=""&&phone!=""&&regPassword!=""){
        
    } else {
        alert("Campos vacios!");
    }
}