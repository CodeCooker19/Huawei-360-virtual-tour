function checkFormAndRedirect() {
    var email = document.querySelector("#email");
    console.log(email)
    if (validateEmail(email.value)) {
        console.log('valid')
        //goToInstructions();
        //goToTour();
        
        isLoggedIn = true;
        ShowLoadingPage();
    }
}

function validateEmail(email) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return (true)
    }
    alert("You have entered an invalid email address!" + email)
    return (false)
}

function goToRegistration() {
    //document.getElementById('introduction').style.display = 'block';
    //document.getElementById('instructions').style.display = 'none';

    $("#introduction").addClass("box-visible");
    $("#introduction").removeClass("box-hidden");

    $("#instructions").addClass("box-hidden");
    $("#instructions").removeClass("box-visible");

    console.log("registration");

    $("#email-form").trigger("reset");
    isLoggedIn = false;
    
    HideIFrameContainer();
}


function goToThemeMap() {
    document.getElementById('instructions').style.display = 'none'
    document.getElementById('fiveG').style.display = 'flex'
    document.getElementById('model-container').style.display = 'block';
}

function goToInstructions() {
    /*
    document.getElementById('fiveG').style.display = 'none'
    document.getElementById('introduction').style.display = 'none'
    document.getElementById('instructions').style.display = 'flex'
    document.getElementById('model-container').style.display = 'block';
    */

    $("#introduction").addClass("box-hidden");
    $("#introduction").removeClass("box-visible");

    $("#instructions").addClass("box-visible");
    $("#instructions").removeClass("box-hidden");
    
    
    // Check session token
    if (sessionStorage.getItem('session_token') != null) {
        // Update session

        var sessionId = sessionStorage.getItem('session_id');
        var sessionToken = sessionStorage.getItem('session_token');
        var url = "https://clients.storyhive.io/HuaWei_Virtual_Tour/app_api/v0.1/UpdateLoginSession.php";

        var formData = {
            'session_id': sessionId,
            'session_token': sessionToken
        };

        $.ajax({
            type: 'POST',
            url: url,
            data: formData,
            encode: true,
            success: function (response, status, xhr) {
                console.log("Response: " + response);

                const responseObj = JSON.parse(response);

            },
            error: function (xhr, status, error) {
                console.log("Something went wrong: " + error);
            }
        });
    }
}

function goToTour() {
    $("#introduction").addClass("box-hidden");
    $("#instructions").addClass("box-hidden");

    console.log('value: ' + $("#email").val());


    var email = $("#email").val();
    var theme = selectedProject;
    var url = "https://clients.storyhive.io/HuaWei_Virtual_Tour/app_api/v0.1/CreateLoginSession.php";
    
    sessionStorage.setItem("email", email);

    var formData = {
        'email': email,
        'theme_selected': theme
    };

    $.ajax({
        type: 'POST',
        url: url,
        data: formData,
        encode: true,
        success: function (response, status, xhr) {
            console.log("Response: " + response);

            const responseObj = JSON.parse(response);

            console.log('test' + responseObj['message']);

            sessionStorage.setItem("session_id", responseObj['session_id']);
            sessionStorage.setItem("session_token", responseObj['session_token']);

        },
        error: function (xhr, status, error) {
            console.log("Something went wrong: " + error);
        }
    });
}
