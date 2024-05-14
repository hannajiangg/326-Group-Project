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
import { Listing, Profile } from "../client/schema.js";
import { deleteListing, getListing, getListingCarousel, getListings, getListingThumbnail, getProfile, getProfileListings, hasListing, hasProfile, putListing, putProfile } from './db.js';
import multer from 'multer';


const app = express()
const port = 8080

const User = {};

const upload = multer({});

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

passport.serializeUser(async (user, done) => {
  User[user.id] = user;
  if (!(await hasProfile(user.id))) {
    await putProfile(new Profile(
      user.id,
      user._json.picture,
      user.displayName,
      user._json.email,
      [],
      [],
      [],
      []
    ))
  }
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = User[id];
  done(null, user);
});

app.get('/api/listings', async (req, res) => {
  // console.log(req.user);
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
    if (await hasListing(id)) {
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

app.get('/api/listings/:id/thumbnail', async (req, res) => {
  const { id } = req.params;
  try {
    if (await hasListing(id)) {
      const { data: thumbnail, content_type } = await getListingThumbnail(id);
      res.setHeader("Content-Type", content_type).send(thumbnail);
    } else {
      res.status(404).json({ error: 'Listing not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/listings/:id/carousel/:index', async (req, res) => {
  const { id, index } = req.params;
  try {
    if (!await hasListing(id)) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    const carouselResult = await getListingCarousel(id, index);
    if (!carouselResult) {
      res.status(404).json({ error: 'Carousel index does not exist' });
      return;
    }
    const { data: image, content_type } = carouselResult;
    res.setHeader("Content-Type", content_type).send(image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/listings', upload.any(), async (req, res) => {
  /**
   * Parses a listing out of a request.
   * @param {Express.Request} req 
   * @returns {Listing}
   */
  function parseListing(req) {
    /** @type {Listing} */
    const listingData = JSON.parse(req.body.listing);
    const files = Object.fromEntries(req.files.map(fileResponse => {
      const name = fileResponse.fieldname;
      const mimeType = fileResponse.mimetype;
      /** @type {Buffer} */
      const buffer = fileResponse.buffer;
      const fileBlob = new Blob([buffer], { type: mimeType });
      return [name, fileBlob];
    }));

    if (!files.thumbnail) throw new Error("Listing must contain thumbnail!");
    listingData.thumbnail = files.thumbnail;

    listingData.carousel = [];
    let carouselIndex = 0;
    while (`carousel-${carouselIndex}` in files) {
      listingData.carousel[carouselIndex] = files[`carousel-${carouselIndex}`];
      carouselIndex++;
    }
    listingData.carouselLength = listingData.carousel.length;
    return listingData;
  }

  let listingData;
  try {
    listingData = parseListing(req);
  } catch (e) {
    res.status(400).send("Failed to parse listing");
    return;
  }

  if (!listingData._id) {
    res.status(400).send("Listing must contain id");
    return;
  }

  if (!listingData.title) {
    res.status(400).send("Listing must have a title");
    return;
  }

  if (!listingData.thumbnail) {
    res.status(400).send("Listing must have a thumbnail");
    return;
  }

  if (!listingData.sellerId) {
    res.status(400).send("Listing must have an associated seller");
    return;
  }

  try {
    if(await hasListing(listingData._id)){
      res.status(400).json({ message: 'Listing already exists!' });
      return;
    }
    await putListing(listingData);
    res.status(201).json({ message: 'Listing created/updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/listings', upload.any(), async (req, res) => {
  /**
   * Parses a listing out of a request.
   * @param {Express.Request} req 
   * @returns {Listing}
   */
  function parseListing(req) {
    /** @type {Listing} */
    const listingData = JSON.parse(req.body.listing);
    const files = Object.fromEntries(req.files.map(fileResponse => {
      const name = fileResponse.fieldname;
      const mimeType = fileResponse.mimetype;
      /** @type {Buffer} */
      const buffer = fileResponse.buffer;
      const fileBlob = new Blob([buffer], { type: mimeType });
      return [name, fileBlob];
    }));

    if (!files.thumbnail) throw new Error("Listing must contain thumbnail!");
    listingData.thumbnail = files.thumbnail;

    listingData.carousel = [];
    let carouselIndex = 0;
    while (`carousel-${carouselIndex}` in files) {
      listingData.carousel[carouselIndex] = files[`carousel-${carouselIndex}`];
      carouselIndex++;
    }
    listingData.carouselLength = listingData.carousel.length;
    return listingData;
  }

  let listingData;
  try {
    listingData = parseListing(req);
  } catch (e) {
    res.status(400).send("Failed to parse listing");
    return;
  }

  if (!listingData._id) {
    res.status(400).send("Listing must contain id");
    return;
  }

  if (!listingData.title) {
    res.status(400).send("Listing must have a title");
    return;
  }

  if (!listingData.thumbnail) {
    res.status(400).send("Listing must have a thumbnail");
    return;
  }

  if (!listingData.sellerId) {
    res.status(400).send("Listing must have an associated seller");
    return;
  }

  try {
    await putListing(listingData);
    res.status(201).json({ message: 'Listing created/updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/listings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await getListing(id);
    if (!req.user || listing.sellerId !== req.user.id) {
      res.status(401).send(`requester id ${req.user?.id} does not match seller id ${listing.sellerId}`);
      return;
    }
    await deleteListing(id);
    res.status(200).end();
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
});

// UNSAFE endpoints for profiles (TESTING)
app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await getProfile()
    res.join(profiles)
  }
  catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/api/profiles/:id', async (req, res) => {
  const { id } = req.params
  try {
    if (await hasProfile(id)) {
      const profile = await getProfile(id);
      res.json(profile);
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.get('/api/profiles/:id/postedListings', async (req, res) => {
  const { id } = req.params
  try {
    res.status(200).json(await getProfileListings(id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.put('/api/profiles', async (req, res) => {
  const profileData = req.body
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Profile created/updated successfully' })
      return
    }
    // profileData._id = req.user._id

    await putProfile(profileData)
    res.status(201).json({ message: 'Profile created/updates successfully' })
  }
  catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// Odd ordering in order to prevent collision with /api/profiles/:id
// Feel free to fix
app.get("/api/self/profile", (req, res) => {
  if (!req.user) {
    res.status(401).send("No Active Session!");
    return;
  }
  res.status(200).send(req.user.id);
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
