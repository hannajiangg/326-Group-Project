const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// temporary database
let users = [
    { id: 1, username: 'user1@umass.edu', password: '12345' },
    { id: 2, username: 'user2@umass.edu', password: '67890' }
];

passport.use(new LocalStrategy(
    (username, password, done) => {
        let user = users.find(u => u.username === username && u.password === password);
        if (!user) {
            return done(null, false, { message: "Incorrect username and password" });
        }
        return done(null, user);
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    let user = users.find(u => id === u.id);
    done(null, user);
});

// Routes
app.post('/login', passport.authenticate('local', { failureRedirect: '/register.html' }), (req, res) => {
    res.redirect('/main.html');
});

app.get('/register.html', (req, res) => {
    res.send('Invalid username or password');
});

app.get('/main.html', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login.html');
    }
    res.send(`Welcome, ${req.user.username}`);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
