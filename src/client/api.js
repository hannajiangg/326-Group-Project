// let listingStore = new PouchDB("listing_store");
import PouchDB from "pouchdb"
let listingStore = new PouchDB("listing_store")

/**
 * Short version of a listing.
 * Whatever is necessary for generating the front page listing.
 */
export class Listing {
  /**
   * ID for the listing.
   * @type { string }
   */
  _id;
  /**
   * Title of the listing
   * @type { string }
   */
  title;
  /**
   * An image that is meant to be the thumbnail of the picture.
   * @type { Blob }
   */
  thumbnail;
  /**
   * @type { Blob[] }
   */
  carousel;
  /**
   * Cost of the item in dollars.
   * @type { number }
   */
  cost;
  /**
   * Short description of the item.
   * @type { string }
   */
  description;
  /**
   * The category of the listing.
   * @type { string }
   */
  category;
  /**
   * The amount available for the listing.
   * @type { number }
   */
  quantity;
  /**
   * The id of the seller
   * @type { string }
   */
  sellerId;

  constructor(
    _id,
    title,
    thumbnail,
    carousel,
    cost,
    description,
    category,
    quantity,
    sellerId,
  ) {
    this._id = _id;
    this.title = title;
    this.thumbnail = thumbnail;
    this.carousel = carousel;
    this.cost = cost;
    this.description = description;
    this.category = category;
    this.quantity = quantity;
    this.sellerId = sellerId;
  }
}

/**
 * Returns a list of all listings.
 * @returns { Promise<String[]> }
 */
export async function getListings() {
  const listings = await listingStore.allDocs();
  return listings.rows.map(x => x.id);
}

/**
 * Returns a listing if it exists
 * @param {string} _id 
 * @returns { Listing | null }
 */
export async function getListing(_id) {
  if(!await hasListing(_id))
    return null;
  let listing = await listingStore.get(_id);
  const thumbnail = await listingStore.getAttachment(_id, "thumbnail");

  const carousel = [];
  for(let i = 0; i < listing.carouselLength; i++){
    const carouselImage = await listingStore.getAttachment(_id, `carousel_${i}`);
    carousel.push(carouselImage);
  }
  return new Listing(
    listing._id,
    listing.title,
    thumbnail,
    carousel,
    listing.cost,
    listing.description,
    listing.category,
    1,
    listing.sellerId,
  );
}

export async function hasListing(_id) {
  return await listingStore.get(_id).then(() => true, () => false)
}

/**
 * 
 * @param {Listing} listing 
 */
export async function putListing(listing) {
  let entry = { ...listing };
  if (await hasListing(listing._id)) {
    entry._rev = (await listingStore.get(listing._id))._rev
  }
  entry = { _rev: entry._rev, ...listing };
  delete entry.thumbnail;
  delete entry.carousel;
  entry.carouselLength = listing.carousel.length;
  await listingStore.put(entry)

  entry = await listingStore.get(listing._id);
  await listingStore.putAttachment(
    listing._id,
    "thumbnail",
    entry._rev,
    listing.thumbnail,
    listing.thumbnail.type
  );

  for(let i = 0; i < listing.carousel.length; i++){
    entry = await listingStore.get(listing._id);
    await listingStore.putAttachment(
      listing._id,
      `carousel_${i}`,
      entry._rev,
      listing.carousel[i],
      listing.carousel[i].type
    );
  }
}

export async function generateFakeData() {
  const image = await fetch("/assets/000.png").then(res => res.blob())
  const carousel = [
    await fetch("/assets/000.png").then(res => res.blob()),
    await fetch("/assets/001.png").then(res => res.blob()),
    await fetch("/assets/002.png").then(res => res.blob()),
    await fetch("/assets/003.png").then(res => res.blob()),
  ]
  // listingStore = new PouchDB("listing_store")
  const fakeListings = [
    new Listing(
      "000",
      "Cool Sweater",
      image,
      carousel,
      49.99,
      "Men's Waterfowl Sweater, Size M",
      "Clothing",
      1,
      "000"
    )
  ]
  await putListing(fakeListings[0]);
}

export async function blobToURL(blob){
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return await new Promise(resolve => reader.onloadend = () => {
        resolve(reader.result);
    });
}

await generateFakeData();

let profileStore = new PouchDB("profile_store");

export class Profile {
  /**
   * ID for the profile.
   * @type { string }
   */
  _id;
  /**
   * For user's profile picture.
   * @type { Blob }
   */
  pfp;
  /**
   * @type { string }
   */
  name;
  /**
   * User's email address.
   * @type { string }
   */
  email;
  /**
   * Saved payment methods.
   * @type { string[] }
   */
  payments;
  /**
   * User's currently posted items.
   * @type { {}[] }
   */
  posted;
  /**
   * User's sold items.
   * @type { {}[] }
   */
  sold;
  /**
   * User's purchased items.
   * @type { {}[] }
   */
  purchased;

  constructor(
    _id,
    pfp,
    name,
    email,
    payments,
    posted,
    sold,
    purchased
  ) {
    this._id = _id;
    this.pfp = pfp;
    this.name = name;
    this.email = email;
    this.payments = payments;
    this.posted = posted;
    this.sold = sold;
    this.purchased = purchased;
  }
}

export async function hasProfile(_id) {
  return await profileStore.get(_id).then(() => true, () => false)
}

/**
 * Returns a profile if it exists
 * @param {string} _id 
 * @returns { Profile | null }
 */
export async function getProfile(_id) {
  if(!await hasProfile(_id))
    return null;
  let profile = await profileStore.get(_id);
  const pfp = await profileStore.getAttachment(_id, "pfp");
  
  return new Profile(
    profile._id,
    pfp,
    profile.name,
    profile.email,
    profile.payments,
    profile.posted,
    profile.sold,
    profile.purchased
  );
}

/**
 * 
 * @param {Profile} profile 
 */
export async function putProfile(profile) {
  let entry = { ...profile };
  if (await hasProfile(profile._id)) {
    entry._rev = (await profileStore.get(profile._id))._rev
  }
  entry = { _rev: entry._rev, ...profile };
  delete entry.pfp;
  await profileStore.put(entry)

  entry = await profileStore.get(profile._id);
  await profileStore.putAttachment(
    profile._id,
    "pfp",
    entry._rev,
    profile.pfp,
    profile.pfp.type
  );
}

export async function generateFakeProfile() {
  const image = await fetch("/assets/zoo_buy_logo.jpg").then(res => res.blob())
  // await profileStore.destroy()
  // profileStore = new PouchDB("profile_store")
  const fakeProfile =
    new Profile(
      "000",
      image,
      "Tim Richards",
      "richards@cs.umass.edu",
      ["Example 1", "Example 2"],
      [
        { _id: "000", name: "Men's Waterfowl Sweater Vest", qt: 1 },
        { name: "Men's Jeans", qt: 2 },
      ],
      [
        { _id: "000", name: "Men's Waterfowl Sweater Vest", qt: 2 },
        { name: "Men's Jeans", qt: 3 },
      ],
      [
        { name: "Used Bike", qt: 1 },
        { name: "UMass T-Shirt", qt: 5 },
      ]
    )
  await putProfile(fakeProfile);
}

await generateFakeProfile();