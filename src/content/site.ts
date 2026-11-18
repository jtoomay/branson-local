/**
 * Global copy and settings for Branson Local Businesses.
 * Sourced from data/scraped/pages.json and data/categories.json (legacy site),
 * lightly edited for sentence case. Keep this the single source of truth for
 * public-facing copy that is not stored in the database.
 */

export const site = {
  name: "Branson Local Businesses",
  shortName: "BLB",
  legalName: "Branson Local Businesses",
  locality: "Branson, Missouri",
  phone: "816-419-0957",
  phoneHref: "tel:+18164190957",
  phoneE164: "+18164190957",
  googleReviewUrl: "https://g.page/r/CRrqz3N5lLllEBM/review",
  social: {
    facebook: "https://www.facebook.com/bransonlocalbusinesses/",
    instagram: "https://www.instagram.com/bransonlocalbusinesses/",
  },
  gaId: "G-HDH80H2XBJ",
  credit: { label: "WebDebSites", url: "https://webdebsites.com/" },
  defaultTitle: "Branson Local Businesses | Branson, Missouri Business Directory",
  titleTemplate: "%s | Branson Local Businesses",
  description:
    "Branson Local Businesses helps you find the best locally owned places to shop, dine, stay and play in Branson, Missouri and the surrounding Ozarks. Thank you for supporting local.",
  keywords: [
    "Branson Missouri",
    "Branson local businesses",
    "Branson business directory",
    "restaurants in Branson",
    "hotels in Branson",
    "Branson shows",
    "shopping in Branson",
    "things to do in Branson",
    "Branson fishing and boating",
    "Branson wedding venues",
    "veteran services in Branson",
    "advertise in Branson",
  ],
} as const;

export const home = {
  slogans: [
    "We bring Branson business to one place",
    "Local businesses keep Branson going strong",
  ],
  intro:
    "Branson Local Businesses is designed to help local businesses keep Branson going strong, and to help the local people! This website will help you find the best local places to shop in Branson, dine, where to stay in Branson, entertainment in Branson and much more. All by locally owned businesses and surrounding areas. Thank you for supporting the local businesses in Branson, Missouri!",
  /** Header slider images from the legacy site. These are paid front-page headers, so they are always shown uncropped. */
  slides: [
    { src: "/legacy/slider-1.png", width: 2240, height: 560, alt: "Truth Traveler 5D virtual reality in Branson, open daily 9am to 6pm" },
    { src: "/legacy/slider-2.jpg", width: 2240, height: 560, alt: "Billy Bob's Dairyland, old fashioned burgers and shakes in Branson" },
    { src: "/legacy/slider-3.jpg", width: 2240, height: 466, alt: "Featured Branson local business" },
    { src: "/legacy/slider-4.png", width: 2240, height: 560, alt: "Featured Branson local business" },
    { src: "/legacy/slider-5.jpg", width: 2240, height: 560, alt: "Secret Garden Boutique storefront, sign and interior in Branson" },
    { src: "/legacy/slider-6.jpg", width: 2240, height: 560, alt: "Featured Branson local business" },
    { src: "/legacy/slider-7.jpg", width: 2240, height: 560, alt: "Featured Branson local business" },
  ],
  advertiseTiles: [
    { label: "Fishing & Boating", slug: "fishing-boating", alt: "Advertise Branson fishing and boating" },
    { label: "Weddings", slug: "wedding-venues", alt: "Advertise your Branson wedding business" },
    { label: "Venues", slug: "wedding-venues", alt: "Advertise your Branson event venue" },
  ],
} as const;

export const tickets = {
  shows: {
    url: "https://bransonlocalbusinesses.i.travel/shows/",
    title: "Tickets to over 100 shows",
    body: "Buy tickets to over 100 shows in Branson, MO, from tribute acts and gospel to comedy and family variety.",
    cta: "Buy show tickets",
  },
  attractions: {
    url: "https://bransonlocalbusinesses.i.travel/attractions/",
    title: "Tickets to over 30 attractions",
    body: "Buy tickets to over 30 attractions in Branson, MO, and make a full day of it in the heart of the Ozarks.",
    cta: "Buy attraction tickets",
  },
} as const;

/** Which categories get which ticket CTA. */
export const categoryTickets: Record<string, keyof typeof tickets> = {
  shows: "shows",
  "things-to-do": "attractions",
};

/** Long-form headings and intros from the legacy category pages (h1s that carried the SEO weight). */
export const categoryPageCopy: Record<string, { h1: string; intro?: string }> = {
  restaurants: { h1: "Restaurants in Branson, Missouri" },
  hotels: { h1: "Hotels & where to stay in Branson, Missouri" },
  shows: { h1: "Shows in Branson, Missouri" },
  shopping: { h1: "Shopping in Branson, Missouri" },
  "specialty-shops": { h1: "Specialty shops in Branson, Missouri" },
  "things-to-do": { h1: "Things to do in Branson" },
  "fishing-boating": { h1: "Fishing & boating in Branson" },
  "wedding-venues": { h1: "Wedding venues in Branson" },
  "day-trips": {
    h1: "Day trips from Branson",
    intro:
      "Looking for a great day trip or a place to spend the night? Eureka Springs, Arkansas is just 50 minutes from Branson. Check out all that Eureka Springs has to offer. Eureka Springs is a city in the Ozark Mountains of northwest Arkansas. It's known for the preserved Victorian buildings of its Historic District, such as the Palace Bath House, Basin Park Hotel and Crescent Hotel, all built around the city's natural springs.",
  },
  "veteran-services": { h1: "Veteran services in Branson, Missouri" },
};

export const advertise = {
  title: "Advertise your business",
  heading: "Advertisement price list",
  intro:
    "Thank you for taking the time to look at my web site and my advertising prices. You will see it is very well priced. As you know you can get on the web site anywhere, anytime and I'm on the first page helping people going to Branson to support the local businesses. Our goal is to help people going to Branson and surrounding area to know where the local businesses are located.",
  note: "All advertising options will link to your website if you have one.",
  term: "Payment is for one year.",
  packages: [
    {
      id: "front-header",
      name: "Front page header",
      price: 200,
      text: "A header on the front page is $200 for a year.",
      detail: "Your full-width banner rotates in the headline slider at the top of the home page.",
      placement: "Home Page",
      listingType: "Full Page Banner",
      highlight: true,
    },
    {
      id: "front-banner",
      name: "Front page banner",
      price: 125,
      text: "A banner on the front page is $125 for a year.",
      detail: "A featured card with your logo among the local favorites on the home page.",
      placement: "Home Page",
      listingType: "Full Page Banner",
    },
    {
      id: "inside-banner",
      name: "Inside page with a banner",
      price: 75,
      text: "An inside page with a banner is only $75 for a year.",
      detail: "A banner placement on the category page that fits your business.",
      placement: "Category Page",
      listingType: "Full Page Banner",
    },
    {
      id: "picture-listing",
      name: "Listing with a picture",
      price: 50,
      text: "If you would like to put a picture of your business with your listing it will cost you only $50 a year.",
      detail: "Your listing shows a photo or logo of your business instead of a monogram.",
      placement: "Category Page",
      listingType: "Text Listing",
    },
    {
      id: "listing",
      name: "Listing on a page",
      price: 35,
      text: "Just putting your listing on a page will be $35 for a year.",
      detail: "Name, address, phone, website and socials on the category page of your choice.",
      placement: "Category Page",
      listingType: "Text Listing",
    },
  ],
} as const;

export const contact = {
  title: "Contact Branson Local Businesses",
  intro:
    "If you have questions or if you would like your Branson business represented, fill out the short form below and we will get back to you as soon as possible!",
  placeOptions: ["Home Page", "Category Page"],
  typeOptions: ["Text Listing", "Full Page Banner"],
} as const;

/** Primary navigation order (mirrors the legacy nav). */
export const navOrder = [
  "hotels",
  "shows",
  "shopping",
  "restaurants",
  "specialty-shops",
  "things-to-do",
  "day-trips",
  "veteran-services",
  "fishing-boating",
  "wedding-venues",
] as const;

/** Categories surfaced directly in the desktop header; the rest live in the Explore panel. */
export const headerPrimary = ["restaurants", "hotels", "shows", "things-to-do"] as const;
