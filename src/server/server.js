import 'dotenv/config'
import express from 'express'
import session from 'express-session';
import logger from 'morgan'
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20'
import path from "node:path"
// import { loadView } from '../client/index.js'

const app = express()
const port = 8080

const User = {};

app.use(
  session({
    secret: process.env['SESSION_SECRET_KEY'],
    resave: false,
    saveUninitialized: true,
  })
);
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('src/client'))
app.use(passport.initialize());
app.use(passport.session());

console.log(new URL('api/login/callback', process.env['HOST_URI']).href)
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env['GOOGLE_CLIENT_ID'],
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
      callbackURL: new URL('api/login/callback', process.env['HOST_URI']).href,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);
passport.serializeUser((user, done) => {
  User[user.id] = user;
  console.log(JSON.stringify(User, undefined, "    "));
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  const user = User[id];
  done(null, user);
});

app.get("/api/login/callback", passport.authenticate('google', {
  successRedirect: '/#main',
  failureRedirect: '/#login',
}));

app.get(
  '/api/login',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
