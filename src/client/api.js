let listingStore = new PouchDB("listing_store");
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
   * An image that is meant to be the thumbnail of the picture.
   * @type { Blob }
   */
  thumbnail;
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
  constructor(
    _id,
    thumbnail,
    cost,
    description,
    category,
  ) {
    this._id = _id;
    this.thumbnail = thumbnail;
    this.cost = cost;
    this.description = description;
    this.category = category;
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
  return new Listing(
    listing._id,
    thumbnail,
    listing.cost,
    listing.description,
    listing.category
  );
}

export async function hasListing(_id) {
  return await listingStore.get(_id).then(() => true, () => false)
}

export async function putShortListing(listing) {
  let entry = { ...listing };
  if (await hasListing(listing._id)) {
    entry._rev = (await listingStore.get(listing._id))._rev
  }
  entry = { _rev: entry._rev, ...listing };
  delete entry.thumbnail;
  delete entry.thumbnailType;
  await listingStore.put(entry)
  entry = await listingStore.get(listing._id);
  await listingStore.putAttachment(
    listing._id,
    "thumbnail",
    entry._rev,
    listing.thumbnail,
    listing.thumbnail.type
  );
}

export async function generateFakeData() {
  const image = await fetch("./dasweatervest.jpeg").then(res => res.blob())
  await listingStore.destroy()
  listingStore = new PouchDB("listing_store")
  const fakeListings = [
    new Listing(
      "000",
      await image,
      49.99,
      "Men's Waterfowl Sweater, Size M",
      "Clothing"
    )
  ]
  await putShortListing(fakeListings[0]);
}

export async function blobToURL(blob){
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return await new Promise(resolve => reader.onloadend = () => {
        resolve(reader.result);
    });
}
