// let loginBtn = document.getElementById('loginBtn')
// console.log(loginBtn)
// loginBtn.addEventListener("submit", () => {
//     // window.location.assign("http://127.0.0.1:8080/main.html")
//     window.location.href = "http://127.0.0.1:8080/main.html"
// })
let loginForm = document.getElementById("loginForm")
loginForm.addEventListener("submit", () => {
    event.preventDefault()
    window.location.href = "http://127.0.0.1:8080/main.html"
})