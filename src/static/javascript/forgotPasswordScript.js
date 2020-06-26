//SERVER DOMAIN
const SERVER_DOMAIN = 'http://192.168.1.71:3000/'

//Get token for post request
let url = window.location.href;
const urlSplit = url.split("/")
const token = urlSplit[5];
console.log(token)

errorMessages = {
    password: [
        'Minimum 8 characters',
        'At least 1 letter 1 Uppercase and 1 number',
        'Password Required'
    ],
    confirm_password: [
        'Please confirm your password',
        'Your Passwords dont match'
    ]
}

//Submit function
function submit() {

    let form = $('form').serializeArray();
    let password = form[0].value
    let confirmPassword = form[1].value

    let countErrorsPassword = 0;
    let countErrorsConfirmPassword = 0;

    //Check password Erros
    if (password.length < 8) {
        document.getElementById("pError0").innerHTML = errorMessages.password[0];
        countErrorsPassword++;
    } else {
        document.getElementById("pError0").innerHTML = "";
    }
    if (!password.match('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$')) {
        document.getElementById("pError1").innerHTML = errorMessages.password[1];
        countErrorsPassword++;
    } else {
        document.getElementById("pError1").innerHTML = "";
    }
    if (password.length === 0){
        document.getElementById("pError2").innerHTML = errorMessages.password[2];
        countErrorsPassword++;
    } else {
        document.getElementById("pError2").innerHTML = "";
    }

    //Check confirm password Erros
    if (confirmPassword.length === 0) {
        document.getElementById("cpError0").innerHTML = errorMessages.confirm_password[0];
        countErrorsConfirmPassword++;
    } else {
        document.getElementById("cpError0").innerHTML = "";
    }
    if (confirmPassword !== password) {
        document.getElementById("cpError0").innerHTML = errorMessages.confirm_password[1];
        countErrorsConfirmPassword++;
    } else {
        document.getElementById("cpError0").innerHTML = "";
    }

    //Add error class
    if (countErrorsPassword > 0) {
        document.getElementById("password").classList.add("is-invalid");
    } else {
        document.getElementById("password").classList.remove("is-invalid");
        document.getElementById("password").classList.add("is-valid");
    }
    if (countErrorsConfirmPassword > 0) {
        document.getElementById("confirmPassword").classList.add("is-invalid");
    } else {
        document.getElementById("confirmPassword").classList.remove("is-invalid");
        document.getElementById("confirmPassword").classList.add("is-valid");
    }

    //Make post
    if(countErrorsPassword === 0 && countErrorsConfirmPassword === 0){

        //document.getElementById("button").classList.remove("btn-primary");
        document.getElementById("button").classList.add("no-click");
        const info = {
            password: password,
            token: token
        }
        fetch(SERVER_DOMAIN + 'forgotPassword/changePassword', {
            method: 'POST',
            body: JSON.stringify(info),
            headers: { "Content-Type": "application/json" }
        })
            .then( (res,err) => {
                let message;
                let color;
                if(err) {
                    message = 'There was an error'
                }
                if(res) {
                    if (res.status === 400) {
                        message = 'Email not registered'
                        color = 'danger'
                    }else if (res.status === 500){
                        message = 'Server error'
                        color = 'danger'
                    } else if (res.status === 200) {
                        message = 'Password changed'
                        color = 'success'
                    } else {
                        message = 'Server Error'
                        color = 'danger'
                    }

                    showToaster(message,color)

                }
            })
    }
    console.log('countErrorPassword: ' + countErrorsPassword)
    console.log('countErrorConfirmPassword: ' + countErrorsConfirmPassword)
}

function showToaster (message,color){
    bs4pop.notice(message, {
        type: color,
        position: 'bottomcenter',
        autoClose: '10000',
        appendType: 'append',
        closeBtn: 'false',
        className: ''
    })
}
