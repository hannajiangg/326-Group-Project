import { loadView } from "../index.js";

async function googleSignIn(token) {
    const response = await fetch('./api/googleLogIn', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(token),
    });
    if(response.status !== 200){
        console.log("Login Failed");
        return;
    }
    loadView('main');
}

export function onNavigate() {
    // google.accounts.id.initialize({
    //     client_id: '681506738065-lm05vc09padgknbbk7i1kvbifshr00qj.apps.googleusercontent.com',
    //     login_uri: './api/login/callback',
    //     ux_mode: 'redirect'
    // });
    // google.accounts.id.renderButton(
    //     document.getElementById('google-sign-in'),
    //     {
    //         type: 'standard',
    //         shape: 'pill',
    //         width: '200',
    //     }
    // );
}
