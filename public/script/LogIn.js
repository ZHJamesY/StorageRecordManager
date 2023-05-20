$(document).ready(function(){

    let showPassword = document.getElementById('showPassword');
    let password = document.getElementById('password');

    showPassword.addEventListener('change', function(){
        if (showPassword.checked) {
            password.type = 'text';
        } 
        else {
            password.type = 'password';
        }
    })

})