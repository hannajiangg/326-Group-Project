// Does routing and stuff
async function loadLoginPage(){
    const loginText = await fetch("./login.html").then(res => res.text());
    document.body.innerHTML = loginText;
}
loadLoginPage();