import 'dotenv/config'
import express from 'express'
import session from 'express-session';
import logger from 'morgan'
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20'
import path from "node:path"
// import { loadView } from '../client/index.js'
// TODO Add endpoints for all database functionality
// import { blobToURL, getListing, hasListing, Listing, putListing } from '../client/api.js'; 
// Client and server code should be separate
import { Listing, Profile } from "../common/schema.js";
import { getListing, getListings, hasListing, hasProfile, putListing } from './db.js';


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
// Middleware
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('src/client'));
app.use(express.static('src/common')); // TODO make a better solution for hosting common files

app.get('/api/listings', async (req, res) => {
  try {
    const listings = await getListings();
    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (hasListing(id)) {
      const listing = await getListing(id);
      res.json(listing);
    } else {
      res.status(404).json({ error: 'Listing not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/listings', async (req, res) => {
  const listingData = req.body;
  try {
    await putListing(listingData);
    res.status(201).json({ message: 'Listing created/updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
  console.log(`Server is running on port ${port}`);
});
