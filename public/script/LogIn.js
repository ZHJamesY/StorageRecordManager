$(document).ready(function(){

    // display content according to selected language
    checkLanguage();

    // get elements
    let langBtn = document.getElementById('langToggleBtn');
    let loginForm = document.getElementById('loginForm');
    let loginBtn = document.getElementById('loginBtn');

    let showPassword = document.getElementById('showPassword');
    let password = document.getElementById('password');

    // reveal password
    showPassword.addEventListener('change', function(){
        if (showPassword.checked) {
            password.type = 'text';
        } 
        else {
            password.type = 'password';
        }
    })

    // add query parameter when log in button is clicked
    $(loginBtn).click(function(){
        if(langBtn.innerHTML == 'English')
        {
            loginForm.action = '/login?lang=' + 'CN';
        }
        else
        {
            loginForm.action = '/login?lang=' + 'ENG';
        }
    });

})

// display language according to language button innerHTML
function checkLanguage()
{

    // get elements
    let langBtn = document.getElementById('langToggleBtn');
    let username = document.getElementById('username');
    let password = document.getElementById('password');
    let loginBtn = document.getElementById('loginBtn');
    let showPassword = document.getElementById('showPasswordLabel');
    let errorMsg = document.getElementById('errorMsg');
    let expiredMsg = document.getElementById('expiredMsg');

    if(langBtn.innerHTML == 'English')
    {
        username.placeholder = '用户名';
        password.placeholder = '密码';
        loginBtn.innerHTML = '登录';
        showPassword.innerHTML = '显示密码';
        if(errorMsg.innerHTML != '')
        {
            errorMsg.innerHTML = '用户名/密码错误。';
        }
        if(expiredMsg.innerHTML != '')
        {
            expiredMsg.innerHTML = '登录信息已过期, 请重新登录。';
        }
    }
    else if(langBtn.innerHTML == '中文')
    {
        username.placeholder = 'Username';
        password.placeholder = 'Password';
        loginBtn.innerHTML = 'Log In';
        showPassword.innerHTML = 'Show Password';
        if(errorMsg.innerHTML != '')
        {
            errorMsg.innerHTML = 'Username/Password incorrect.';
        }
        if(expiredMsg.innerHTML != '')
        {
            expiredMsg.innerHTML = 'Your session has expired, please log in again.';
        }
    }
}

// click language button toggle between two languages
function toggleLanguage()
{
    // get elements
    let langBtn = document.getElementById('langToggleBtn');

    if(langBtn.innerHTML == 'English')
    {
        langBtn.innerHTML = '中文';
        checkLanguage();
    }
    else
    {
        langBtn.innerHTML = 'English';
        checkLanguage();
    }
}
