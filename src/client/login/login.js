async function googleSignIn(token) {
    console.log(token);
    const response = await fetch('./api/googleLogIn', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(token),
    });
    if(response.status !== 200){
        console.log("Login Failed");
    } else {
        loadView('main');
    }
}

export function onNavigate() {
    google.accounts.id.initialize({
        client_id: '681506738065-lm05vc09padgknbbk7i1kvbifshr00qj.apps.googleusercontent.com',
        callback: googleSignIn,
    });
    google.accounts.id.renderButton(
        document.getElementById('google-sign-in'),
        {
            type: 'standard',
            shape: 'pill',
            width: '200',
        }
    );

    let loginForm = document.getElementById('loginForm')
    let usernameInp = document.getElementById('password')
}
