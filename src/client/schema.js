/**
 * Represents a Listing.
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
   * The length of the carousel
   * @type { number }
   */
  carouselLength;
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
    quantity,
    sellerId,
  ) {
    this._id = _id;
    this.title = title;
    this.thumbnail = thumbnail;
    this.carousel = carousel;
    this.carouselLength = carousel.length;
    this.cost = cost;
    this.description = description;
    this.quantity = quantity;
    this.sellerId = sellerId;
  }
}

/**
 * Represents a User.
 */
export class Profile {
  /**
   * ID for the profile.
   * @type { string }
   */
  _id;
  /**
   * For user's profile picture.
   * @type { string }
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
   * User's sold items as listing IDs. Stored here since it is a many-to-many connection.
   * @type { string[] }
   */
  sold;
  /**
   * User's purchased items as listing IDs. Stored here since it is a many-to-many connection.
   * @type { string[] }
   */
  purchased;

  constructor(
    _id,
    pfp,
    name,
    email,
    payments,
    sold,
    purchased
  ) {
    this._id = _id;
    this.pfp = pfp;
    this.name = name;
    this.email = email;
    this.payments = payments;
    this.sold = sold;
    this.purchased = purchased;
  }
}

