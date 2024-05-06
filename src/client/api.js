// TODO make all database related functions use fetch
// import PouchDB from "pouchdb"
// let listingStore = new PouchDB("listing_store")

import { Listing, Profile } from "../common/schema";

/**
 * Returns a list of all listings.
 * @returns { Promise<String[]> }
 */
export async function getListings() {
  const response = await fetch('./api/listings');
  return response.json();
}

// You must specify an id when fetching a listing
// export async function getListing() {
//   const response = await fetch(`./api/listings`)
//   if (response.ok) {
//     return response.json()
//   }
//   else {
//     throw new Error('Failed to fetch listings')
//   }
// }

/**
 * Returns a listing if it exists
 * @param {string} _id 
 * @returns { Listing | null }
 */
// export async function getListing(_id) {
//   if(!await hasListing(_id))
//     return null;
//   let listing = await listingStore.get(_id);
//   const thumbnail = await listingStore.getAttachment(_id, "thumbnail");

//   const carousel = [];
//   for(let i = 0; i < listing.carouselLength; i++){
//     const carouselImage = await listingStore.getAttachment(_id, `carousel_${i}`);
//     carousel.push(carouselImage);
//   }
//   return new Listing(
//     listing._id, 
//     listing.title,
//     thumbnail,
//     carousel,
//     listing.cost,
//     listing.description,
//     listing.category,
//     1,
//     listing.sellerId,
//   );
// }

/**
 * Returns a listing if it exists
 * @param {string} _id 
 * @returns { Listing | null }
 */
export async function getListing(_id) {
  const response = await fetch(`./api/listings/${_id}`)
  return response.json();
}

/**
 * Returns true if a listing id exists
 * @param {string} _id 
 * @returns {boolean}
 */
export async function hasListing(_id) {
  const response = await fetch(`./api/listings/${_id}/exists`)
  return await response.body();
}

// export async function hasListing(_id) {
//   try {
//     const response = await fetch(`./api/listings/${_id}`)
//     if (response.ok) {
//       return true
//     }
//     else if (response.status === 404) return false 
//     else throw new Error('Failed to fetch listing existence')
//   }
//   catch (error) {
//     console.error('Error fetching listing: ', error)
//     throw error
//   }
// }

/**
 * 
 * @param {Listing} listing 
 */
// export async function putListing(listing) {
//   let entry = { ...listing };
//   if (await hasListing(listing._id)) {
//     entry._rev = (await listingStore.get(listing._id))._rev
//   }
//   entry = { _rev: entry._rev, ...listing };
//   delete entry.thumbnail;
//   delete entry.carousel;
//   entry.carouselLength = listing.carousel.length;
//   await listingStore.put(entry)

//   entry = await listingStore.get(listing._id);
//   await listingStore.putAttachment(
//     listing._id,
//     "thumbnail",
//     entry._rev,
//     listing.thumbnail,
//     listing.thumbnail.type
//   );

//   for(let i = 0; i < listing.carousel.length; i++){
//     entry = await listingStore.get(listing._id);
//     await listingStore.putAttachment(
//       listing._id,
//       `carousel_${i}`,
//       entry._rev,
//       listing.carousel[i],
//       listing.carousel[i].type
//     );
//   }
// }

export async function putListing(listing) {
  try {
    // check if the listing exists
    const exists = await hasListing(listing._id)
    let entry = { ...listing }
    if (exists) {
      entry._rev = (await listingStore.get(listing._id))._rev
    }
    entry.carouselLength = listing.carousel.length

    await fetch(`./api/listings/${listing._id}`, {
      method: exists ? 'PUT' : 'POST', 
      headers: {
        'Content-type' : 'application/json'  
      },
      body: JSON.stringify(entry)
    })

    // thumbnail implementation
    if (listing.thumbnail) {
      await fetch(`./api/listings/${listing._id}/thumbnail`, {
        method: 'PUT',
        body: listing.thumbnail
      })
    }

    // uploading images in carousel
    for (let i = 0; i < listing.carousel.length; i++) {
      // fetch the listings and put them in the carousel
      await fetch(`./api/listings/${listing._id}`, {
        method: 'PUT', 
        body: listing.carousel
      })
    }
    console.log('Listing created successfully')
  }
  catch (error) {
    console.error('Error creating/updating data', error)
    throw error
  }
}

// export async function generateFakeData() {
//   const image = await fetch("/assets/dasweatervest.jpeg").then(res => res.blob())
//   const carousel = [
//     await fetch("/assets/000.png").then(res => res.blob()),
//     await fetch("/assets/001.png").then(res => res.blob()),
//     await fetch("/assets/002.png").then(res => res.blob()),
//     await fetch("/assets/003.png").then(res => res.blob()),
//   ]
//   // listingStore = new PouchDB("listing_store")
  // const fakeListings = [
  //   new Listing(
  //     "000",
  //     "Cool Sweater",
  //     image,
  //     carousel,
  //     49.99,
  //     "Men's Waterfowl Sweater, Size M",
  //     "Clothing",
  //     1,
  //     "000"
  //   )
  // ]
  // await putListing(fakeListings[0]);
// }

export async function generateFakeData() {
  try {
    const imgPath = '/assets/dasweatervest.jpeg'
    const carouselImgPaths = ["/assets/000.png", "/assets/001.png", "/assets/002.png", "/assets/003.png"]

    const imgBlob = await fetch(imgPath)
    .then(res => res.blob())

    const carouselBlobs = await Promise.all(carouselImgPaths.map(async (url) => {
      const resurl = await fetch(url)
      return resurl.blob()
    }))

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
    console.log('fake data generated successfully')
  }
  catch (error) {
    console.log('Error generating data: ', error)
  }
}

// export async function blobToURL(blob){
//     const reader = new FileReader();
//     reader.readAsDataURL(blob);
//     return await new Promise(resolve => reader.onloadend = () => {
//         resolve(reader.result);
//     });
// }

export async function blobToURL(blob) {
  try {
    const dataURL = await new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onloadend = () => res(reader.result)
      reader.onerror = rej
      reader.readAsDataURL(blob)
    })
    return dataURL
  }
  catch (error) {
    console.log('Error converting blob to data url', error)
  }
}

await generateFakeData();

// let profileStore = new PouchDB("profile_store");

// export async function hasProfile(_id) {
//   return await profileStore.get(_id).then(() => true, () => false)
// }

export async function hasProfile(_id) {
  try {
    const response = await fetch(`./api/profiles/${_id}`)
    if (response.ok) {
      return true
    }
    else if (response.status === 404) return false
    else throw new Error('Failed to fetch profile existence')
  }
  catch (error) {
    console.error('Error fetching profile: ', error)
    throw error
  }
}

/**
 * Returns a profile if it exists
 * @param {string} _id 
 * @returns { Profile | null }
 */
// export async function getProfile(_id) {
//   if(!await hasProfile(_id))
//     return null;
//   let profile = await profileStore.get(_id);
//   const pfp = await profileStore.getAttachment(_id, "pfp");
  
  // return new Profile(
  //   profile._id,
  //   pfp,
  //   profile.name,
  //   profile.email,
  //   profile.payments,
  //   profile.posted,
  //   profile.sold,
  //   profile.purchased
  // );
// }

export async function getProfile(_id) {
  try {
    const response = await fetch(`./api/profiles/${_id}`)
    if (response.ok) {
      // get the profile data
      const profilData = await response.json()
      // get the pfp
      const pfpResponse = await fetch(`./api/profiles/${_id}/pfp`)
      // check to see if this data is ok
      if (!pfpResponse.ok) {
        throw new Error('Failed to fetch profile picture')
      }
      // convert this profile pic to a blob 
      // const pfpBlob = await pfpResponse.blob()
      return new Profile(
        profilData._id,
        pfp,
        profilData.name,
        profilData.email,
        profilData.payments,
        profilData.posted,
        profilData.sold,
        profilData.purchased
      )
    }
    else if (response.status === 404) return null
    else throw new Error('Error fetching profile')
  }
  catch (error) {
    console.log('Error putting data: ', error)
  }  
}

/**
 * 
 * @param {Profile} profile 
 */
// export async function putProfile(profile) {
//   let entry = { ...profile };
//   if (await hasProfile(profile._id)) {
//     entry._rev = (await profileStore.get(profile._id))._rev
//   }
//   entry = { _rev: entry._rev, ...profile };
//   delete entry.pfp;
//   await profileStore.put(entry)

//   entry = await profileStore.get(profile._id);
//   await profileStore.putAttachment(
//     profile._id,
//     "pfp",
//     entry._rev,
//     profile.pfp,
//     profile.pfp.type
//   );
// }

export async function putProfile(profile) {
  try {
    const hasProfResponse = await fetch(`./api/profiles/${profile._id}`)
    // temp variable to store rev
    let rev
    if (hasProfResponse.ok) {
      const prof = await hasProfResponse.json()
      rev = prof._rev
    }
    let entry = { ...profile, _rev: rev }
    const putProfRes = await fetch(`./api/profiles/${profile._id}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(entry)
    })

    if (!putProfRes.ok) {
      throw new Error('Error fetching putting data')
    }

    const putAttachmentRes = await fetch(`./api/profiles/${profile._id}/pfp`, {
      method: 'PUT',
      body: profile.pfp
    })

    if (!putAttachmentRes.ok) {
      throw new Error('Error fetching puttinh data attachment')
    }
  }
  catch (error) {
    console.log('Error putting profile', error)
  }
}

// would prolly stay the same
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