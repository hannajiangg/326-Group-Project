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
import { deleteListing, getListing, getListingCarousel, getListings, getListingThumbnail, getProfile, getProfileListings, getProfiles, hasListing, hasProfile, putListing, putProfile } from './db.js';
import multer from 'multer';
import { readFile } from 'node:fs/promises';


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

  if (!listingData._id) {
    throw new Error("Listing must contain id");
  }

  if (!listingData.title) {
    throw new Error("Listing must have a title");
  }

  if (!listingData.thumbnail) {
    throw new Error("Listing must have a thumbnail");
  }

  if (!listingData.sellerId) {
    throw new Error("Listing must have an associated seller");
  }

  return listingData;
}

app.post('/api/listings', upload.any(), async (req, res) => {
  /** @type {Listing} */
  let listingData;
  try {
    listingData = parseListing(req);
  } catch (e) {
    res.status(400).send("Failed to parse listing");
    return;
  }

  if (!req.user || (req.user.id !== listingData.sellerId)) {
    res.status(401).json({ message: 'sellerId must match user ID' });
    return;
  }

  try {
    if (await hasListing(listingData._id)) {
      res.status(409).json({ message: 'Listing already exists!' });
      return;
    }
    await putListing(listingData);
    res.status(201).json({ message: 'Listing created/updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

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

app.get('/api/listings/:id/exists', async (req, res) => {
  const { id } = req.params;
  try {
    res.status(200).json({ exists: await hasListing(id) });
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

app.put('/api/listings', upload.any(), async (req, res) => {
  /** @type {Listing} */
  let listingData;
  try {
    listingData = parseListing(req);
  } catch (e) {
    res.status(400).send(e.message);
    return;
  }

  if (!req.user || (req.user.id !== listingData.sellerId)) {
    res.status(401).json({ message: 'sellerId must match user ID' });
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
    const listingData = await getListing(id);
    if (!req.user || (req.user.id !== listingData.sellerId)) {
      res.status(401).json({ message: 'sellerId must match user ID' });
      return;
    }
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

app.post('/api/profiles', async (req, res) => {
  /** @type {Profile} */
  const profileData = req.body
  try {
    if (await hasProfile()) {
      res.status(409).json({ message: 'Profile already exists' })
      return;
    }

    if (!req.user || (req.user.id !== profileData._id)) {
      res.status(401).json({ message: 'profile id must match user ID' });
      return;
    }

    await putProfile(profileData)
    res.status(201).json({ message: 'Profile created successfully' })
  }
  catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await getProfiles();
    res.status(200).json(profiles)
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

app.get('/api/profiles/:id/exists', async (req, res) => {
  const { id } = req.params
  try {
    res.status(200).json({ exists: await hasProfile(id) });
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
  /** @type {Profile} */
  const profileData = req.body
  try {
    if (!req.user || (req.user.id !== profileData._id)) {
      res.status(401).json({ message: 'profile id must match user ID' });
      return;
    }

    await putProfile(profileData)
    res.status(201).json({ message: 'Created/Updated profile successfully' })
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

/**
 * Generates fake data
 */
export async function generateFakeListings() {
  try {
  }
  catch (error) {
    console.log('Error generating data: ', error)
  }
}

async function uriToJPEGBlob(uri) {
  const data = await readFile(uri);
  return new Blob([data.buffer], {type: "image/jpeg"});
}

async function createMockData() {
  // Generate fake listing data
  const __dirname = import.meta.dirname;
  const imgPath = `${__dirname}/fakeAssets/dasweatervest.jpeg`
  const carouselImgPaths = [
    `${__dirname}/fakeAssets/sweater1.jpeg`,
    `${__dirname}/fakeAssets/sweater2.jpeg`,
    `${__dirname}/fakeAssets/sweater3.jpeg`,
    `${__dirname}/fakeAssets/sweater1.jpeg`
  ]

  const imgBlob = await uriToJPEGBlob(imgPath);

  const carouselBlobs = await Promise.all(carouselImgPaths.map(uriToJPEGBlob));

  const fakeListings = [
    new Listing(
      "000",
      "Cool Sweater",
      imgBlob,
      carouselBlobs,
      49.99,
      "Men's Waterfowl Sweater, Size M",
      1,
      "000"
    )
  ]
  fakeListings.forEach(putListing);
  // Generate fake profile
  const fakeProfile =
    new Profile(
      "000",
      "./assets/zoo_buy_logo.jpg",
      "Tim Richards",
      "richards@cs.umass.edu",
      ["Example 1", "Example 2"],
      [
        "000"
      ],
      []
    )
  await putProfile(fakeProfile);
}

if(process.env.DEV){
  createMockData();
}
