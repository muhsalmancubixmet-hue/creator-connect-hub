/**
 * Centralized mock data for the Influencers.com Business App.
 * Replace these exports with API calls to the Django backend later.
 * Nothing here should be duplicated inside components.
 */

import { CITY_OPTIONS, geoForCity, type GeoPoint } from "./geo";
import { formatMoney, type CurrencyCode } from "@/lib/currency";

export { formatMoney };

export type Platform =
  | "Instagram"
  | "YouTube"
  | "Facebook"
  | "TikTok"
  | "X"
  | "LinkedIn"
  | "Snapchat"
  | "Threads"
  | "Pinterest"
  | "Twitch";

export type Category =
  | "Food"
  | "Travel"
  | "Fashion"
  | "Beauty"
  | "Lifestyle"
  | "Fitness"
  | "Technology"
  | "Gaming"
  | "Education"
  | "Photography"
  | "Comedy"
  | "Entertainment"
  | "Parenting"
  | "Business"
  | "Finance"
  | "Automotive"
  | "Sports"
  | "Local creators";

/** Languages are configuration-driven (SaaS Manager); any string is valid. */
export type Language = string;

export type ServiceName =
  | "Reel"
  | "Post"
  | "Story"
  | "YouTube Video"
  | "YouTube Short"
  | "UGC"
  | "Product Review"
  | "Event Appearance"
  | "Product Photography";

export const CATEGORIES: Category[] = [
  "Food",
  "Travel",
  "Fashion",
  "Beauty",
  "Lifestyle",
  "Fitness",
  "Technology",
  "Gaming",
  "Education",
  "Photography",
  "Comedy",
  "Entertainment",
  "Parenting",
  "Business",
  "Finance",
  "Automotive",
  "Sports",
  "Local creators",
];

/** Selectable locations come from the global catalog (src/data/geo.ts). */
export const LOCATIONS = CITY_OPTIONS;

export const LANGUAGES: Language[] = [
  "English",
  "Malayalam",
  "Hindi",
  "Arabic",
  "Spanish",
  "French",
  "German",
  "Tamil",
  "Mandarin",
  "Other",
];

export const PLATFORMS: Platform[] = [
  "Instagram",
  "YouTube",
  "Facebook",
  "TikTok",
  "X",
  "LinkedIn",
  "Snapchat",
  "Threads",
  "Pinterest",
  "Twitch",
];

export const SERVICES: ServiceName[] = [
  "Reel",
  "Post",
  "Story",
  "YouTube Video",
  "YouTube Short",
  "UGC",
  "Product Review",
  "Event Appearance",
  "Product Photography",
];

export interface CreatorService {
  name: ServiceName;
  price: number;
  turnaround: string;
}

export interface SocialAccount {
  platform: Platform;
  handle: string;
  followers: number;
  engagement: number;
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  cover: string;
  verified: boolean;
  socialConnected: boolean;
  category: Category;
  secondaryCategories: Category[];
  location: string;
  languages: Language[];
  bio: string;
  about: string;
  mainPlatform: Platform;
  followers: number;
  engagement: number;
  startingPrice: number;
  responseRate: number;
  lastActiveDays: number;
  services: CreatorService[];
  socials: SocialAccount[];
  portfolio: { id: string; type: "Image" | "Reel" | "Video"; src: string; caption: string }[];
  audience: {
    female: number;
    male: number;
    topAge: string;
    topCities: string[];
    authenticity: number;
  };
  collaborations: { brand: string; work: string; year: number }[];
  testimonials: { business: string; quote: string; rating: number }[];
  mediaKit: string;
  /** Structured location — display string `location` is derived for UI. */
  geo: GeoPoint;
  currency: CurrencyCode;
  serviceAreas: string[];
  remote: boolean;
  travel: boolean;
}

type DemoCreator = Omit<Creator, "geo" | "currency" | "serviceAreas" | "remote" | "travel">;

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/800`;
const face = (n: number) => `https://i.pravatar.cc/400?img=${n}`;

function portfolioFor(seed: string) {
  const types: ("Image" | "Reel" | "Video")[] = [
    "Reel",
    "Image",
    "Image",
    "Video",
    "Image",
    "Reel",
  ];
  const captions = [
    "Brand collaboration shoot",
    "Campaign work for a local brand",
    "Behind the scenes",
    "Product feature",
    "Travel story frame",
    "Studio session",
  ];
  return types.map((type, i) => ({
    id: `${seed}-${i}`,
    type,
    src: img(`${seed}-${i}`),
    caption: captions[i] ?? "Portfolio",
  }));
}

const demoKeralaCreators: DemoCreator[] = [
  {
    id: "c1",
    name: "Anjali Menon",
    handle: "@anjaliplates",
    avatar: face(45),
    cover: img("anjali-cover"),
    verified: true,
    socialConnected: true,
    category: "Food",
    secondaryCategories: ["Local creators", "Lifestyle"],
    location: "Ernakulam (Kochi)",
    languages: ["Malayalam", "English"],
    bio: "Kochi food storyteller. Thattukada to fine dining.",
    about:
      "I have been documenting Kerala's food culture for six years — from Fort Kochi breakfast joints to new-wave Kochi restaurants. My audience trusts honest reviews and shows up for openings.",
    mainPlatform: "Instagram",
    followers: 184000,
    engagement: 6.4,
    startingPrice: 12000,
    responseRate: 94,
    lastActiveDays: 1,
    services: [
      { name: "Reel", price: 18000, turnaround: "5 days" },
      { name: "Post", price: 12000, turnaround: "3 days" },
      { name: "Story", price: 6000, turnaround: "1 day" },
      { name: "Product Review", price: 22000, turnaround: "7 days" },
    ],
    socials: [
      { platform: "Instagram", handle: "@anjaliplates", followers: 184000, engagement: 6.4 },
      { platform: "YouTube", handle: "Anjali Eats Kerala", followers: 62000, engagement: 4.1 },
    ],
    portfolio: portfolioFor("anjali"),
    audience: {
      female: 62,
      male: 38,
      topAge: "25-34",
      topCities: ["Kochi", "Thrissur", "Bengaluru"],
      authenticity: 93,
    },
    collaborations: [
      { brand: "Kayees Rahmathulla Hotel", work: "Reel series", year: 2025 },
      { brand: "Fort House Kochi", work: "Menu launch", year: 2025 },
      { brand: "Milma", work: "UGC pack", year: 2024 },
    ],
    testimonials: [
      {
        business: "Chai Kada Kochi",
        quote: "Our weekend footfall doubled after her reel. Very professional with timelines.",
        rating: 5,
      },
    ],
    mediaKit: "anjali-menon-mediakit.pdf",
  },
  {
    id: "c2",
    name: "Vishnu Prasad",
    handle: "@vishnurides",
    avatar: face(12),
    cover: img("vishnu-cover"),
    verified: true,
    socialConnected: true,
    category: "Travel",
    secondaryCategories: ["Photography"],
    location: "Wayanad",
    languages: ["Malayalam", "English", "Hindi"],
    bio: "Wayanad based travel filmmaker. Roads, resorts, rain.",
    about:
      "Long-form travel films and short reels across the Western Ghats. I work with resorts, homestays and tourism boards on cinematic destination content.",
    mainPlatform: "YouTube",
    followers: 412000,
    engagement: 5.1,
    startingPrice: 25000,
    responseRate: 81,
    lastActiveDays: 3,
    services: [
      { name: "YouTube Video", price: 65000, turnaround: "14 days" },
      { name: "YouTube Short", price: 22000, turnaround: "6 days" },
      { name: "Reel", price: 25000, turnaround: "6 days" },
      { name: "Product Photography", price: 18000, turnaround: "5 days" },
    ],
    socials: [
      { platform: "YouTube", handle: "Vishnu Rides", followers: 412000, engagement: 5.1 },
      { platform: "Instagram", handle: "@vishnurides", followers: 138000, engagement: 4.4 },
    ],
    portfolio: portfolioFor("vishnu"),
    audience: {
      female: 34,
      male: 66,
      topAge: "18-24",
      topCities: ["Kozhikode", "Kochi", "Chennai"],
      authenticity: 89,
    },
    collaborations: [
      { brand: "Vythiri Meadows", work: "Destination film", year: 2025 },
      { brand: "Kerala Homestays Collective", work: "Series", year: 2024 },
    ],
    testimonials: [
      {
        business: "Vythiri Meadows",
        quote: "Cinematic quality far above what we expected for the budget.",
        rating: 5,
      },
    ],
    mediaKit: "vishnu-prasad-mediakit.pdf",
  },
  {
    id: "c3",
    name: "Fathima Rasheed",
    handle: "@fathimastyled",
    avatar: face(47),
    cover: img("fathima-cover"),
    verified: true,
    socialConnected: true,
    category: "Fashion",
    secondaryCategories: ["Beauty"],
    location: "Kozhikode",
    languages: ["Malayalam", "English"],
    bio: "Modest fashion & festive styling from Calicut.",
    about:
      "Styling reels for boutiques, textile showrooms and jewellery brands across Malabar. Strong wedding-season performance.",
    mainPlatform: "Instagram",
    followers: 256000,
    engagement: 7.2,
    startingPrice: 15000,
    responseRate: 97,
    lastActiveDays: 1,
    services: [
      { name: "Reel", price: 24000, turnaround: "5 days" },
      { name: "Post", price: 15000, turnaround: "3 days" },
      { name: "Story", price: 7000, turnaround: "1 day" },
      { name: "Event Appearance", price: 55000, turnaround: "On date" },
    ],
    socials: [
      { platform: "Instagram", handle: "@fathimastyled", followers: 256000, engagement: 7.2 },
      { platform: "Pinterest", handle: "fathimastyled", followers: 24000, engagement: 2.2 },
    ],
    portfolio: portfolioFor("fathima"),
    audience: {
      female: 84,
      male: 16,
      topAge: "18-24",
      topCities: ["Kozhikode", "Malappuram", "Dubai"],
      authenticity: 95,
    },
    collaborations: [
      { brand: "Calicut Silks", work: "Onam campaign", year: 2025 },
      { brand: "Zaara Boutique", work: "Festive lookbook", year: 2025 },
    ],
    testimonials: [
      {
        business: "Calicut Silks",
        quote: "Sold out two festive collections within a week of her reel.",
        rating: 5,
      },
    ],
    mediaKit: "fathima-rasheed-mediakit.pdf",
  },
  {
    id: "c4",
    name: "Arjun Nair",
    handle: "@arjuntechmalayalam",
    avatar: face(59),
    cover: img("arjun-cover"),
    verified: true,
    socialConnected: true,
    category: "Technology",
    secondaryCategories: ["Education"],
    location: "Thiruvananthapuram",
    languages: ["Malayalam", "English"],
    bio: "Malayalam tech reviews. Phones, gadgets, startups.",
    about:
      "Detailed Malayalam gadget reviews and startup explainers. High intent, purchase-ready audience across Kerala and the Gulf.",
    mainPlatform: "YouTube",
    followers: 690000,
    engagement: 4.3,
    startingPrice: 40000,
    responseRate: 72,
    lastActiveDays: 2,
    services: [
      { name: "YouTube Video", price: 95000, turnaround: "12 days" },
      { name: "YouTube Short", price: 30000, turnaround: "5 days" },
      { name: "Product Review", price: 85000, turnaround: "12 days" },
    ],
    socials: [
      { platform: "YouTube", handle: "Arjun Tech Malayalam", followers: 690000, engagement: 4.3 },
      { platform: "Instagram", handle: "@arjuntech", followers: 121000, engagement: 3.6 },
      { platform: "X", handle: "@arjuntech", followers: 18000, engagement: 1.8 },
    ],
    portfolio: portfolioFor("arjun"),
    audience: {
      female: 22,
      male: 78,
      topAge: "25-34",
      topCities: ["Thiruvananthapuram", "Kochi", "Riyadh"],
      authenticity: 91,
    },
    collaborations: [
      { brand: "Nexgen Mobiles", work: "Launch review", year: 2025 },
      { brand: "Technopark Startups Meet", work: "Event coverage", year: 2024 },
    ],
    testimonials: [
      {
        business: "Nexgen Mobiles",
        quote: "Drove real store walk-ins across three districts.",
        rating: 4,
      },
    ],
    mediaKit: "arjun-nair-mediakit.pdf",
  },
  {
    id: "c5",
    name: "Sneha Krishnan",
    handle: "@snehaglow",
    avatar: face(32),
    cover: img("sneha-cover"),
    verified: false,
    socialConnected: true,
    category: "Beauty",
    secondaryCategories: ["Lifestyle"],
    location: "Thrissur",
    languages: ["Malayalam", "Tamil", "English"],
    bio: "Skincare that works in Kerala humidity.",
    about:
      "Honest skincare and salon reviews for humid climates. Known for high save-rates and detailed captions.",
    mainPlatform: "Instagram",
    followers: 88000,
    engagement: 8.1,
    startingPrice: 8000,
    responseRate: 99,
    lastActiveDays: 1,
    services: [
      { name: "Reel", price: 12000, turnaround: "4 days" },
      { name: "UGC", price: 8000, turnaround: "5 days" },
      { name: "Product Review", price: 14000, turnaround: "6 days" },
      { name: "Story", price: 4000, turnaround: "1 day" },
    ],
    socials: [
      { platform: "Instagram", handle: "@snehaglow", followers: 88000, engagement: 8.1 },
      { platform: "Threads", handle: "@snehaglow", followers: 9000, engagement: 3.2 },
    ],
    portfolio: portfolioFor("sneha"),
    audience: {
      female: 91,
      male: 9,
      topAge: "18-24",
      topCities: ["Thrissur", "Kochi", "Coimbatore"],
      authenticity: 96,
    },
    collaborations: [
      { brand: "Ayur Leaf Naturals", work: "UGC pack", year: 2025 },
      { brand: "Glow Room Thrissur", work: "Salon launch", year: 2024 },
    ],
    testimonials: [
      { business: "Ayur Leaf Naturals", quote: "Best UGC value we have booked.", rating: 5 },
    ],
    mediaKit: "sneha-krishnan-mediakit.pdf",
  },
  {
    id: "c6",
    name: "Rahul Thomas",
    handle: "@rahulfitkochi",
    avatar: face(15),
    cover: img("rahul-cover"),
    verified: true,
    socialConnected: false,
    category: "Fitness",
    secondaryCategories: ["Lifestyle"],
    location: "Ernakulam (Kochi)",
    languages: ["Malayalam", "English"],
    bio: "Coach. Fat loss without fad diets.",
    about:
      "Strength coach working with gyms, supplement brands and healthy meal services in Kochi.",
    mainPlatform: "Instagram",
    followers: 142000,
    engagement: 5.6,
    startingPrice: 10000,
    responseRate: 88,
    lastActiveDays: 4,
    services: [
      { name: "Reel", price: 16000, turnaround: "5 days" },
      { name: "Post", price: 10000, turnaround: "3 days" },
      { name: "Event Appearance", price: 40000, turnaround: "On date" },
    ],
    socials: [
      { platform: "Instagram", handle: "@rahulfitkochi", followers: 142000, engagement: 5.6 },
      { platform: "YouTube", handle: "Rahul Fit", followers: 35000, engagement: 3.4 },
    ],
    portfolio: portfolioFor("rahul"),
    audience: {
      female: 41,
      male: 59,
      topAge: "25-34",
      topCities: ["Kochi", "Alappuzha", "Doha"],
      authenticity: 88,
    },
    collaborations: [{ brand: "Iron Yard Gym", work: "Membership drive", year: 2025 }],
    testimonials: [
      { business: "Iron Yard Gym", quote: "62 sign-ups from one campaign week.", rating: 4 },
    ],
    mediaKit: "rahul-thomas-mediakit.pdf",
  },
  {
    id: "c7",
    name: "Devika Pillai",
    handle: "@devikaparenting",
    avatar: face(26),
    cover: img("devika-cover"),
    verified: false,
    socialConnected: true,
    category: "Parenting",
    secondaryCategories: ["Education", "Lifestyle"],
    location: "Kottayam",
    languages: ["Malayalam", "English"],
    bio: "Mom of two. Schools, toys, real routines.",
    about:
      "Parenting content with very high comment engagement. Works well for schools, paediatric clinics and kids' brands.",
    mainPlatform: "Instagram",
    followers: 64000,
    engagement: 9.3,
    startingPrice: 6000,
    responseRate: 95,
    lastActiveDays: 2,
    services: [
      { name: "Reel", price: 9000, turnaround: "5 days" },
      { name: "UGC", price: 6000, turnaround: "6 days" },
      { name: "Story", price: 3000, turnaround: "1 day" },
    ],
    socials: [
      { platform: "Instagram", handle: "@devikaparenting", followers: 64000, engagement: 9.3 },
      { platform: "Facebook", handle: "Devika Parenting", followers: 41000, engagement: 5.0 },
    ],
    portfolio: portfolioFor("devika"),
    audience: {
      female: 88,
      male: 12,
      topAge: "25-34",
      topCities: ["Kottayam", "Pathanamthitta", "Kochi"],
      authenticity: 97,
    },
    collaborations: [{ brand: "Little Scholars Kottayam", work: "Admission campaign", year: 2025 }],
    testimonials: [
      {
        business: "Little Scholars Kottayam",
        quote: "Every enquiry mentioned her video.",
        rating: 5,
      },
    ],
    mediaKit: "devika-pillai-mediakit.pdf",
  },
  {
    id: "c8",
    name: "Nikhil Varma",
    handle: "@nikhilcomedy",
    avatar: face(51),
    cover: img("nikhil-cover"),
    verified: true,
    socialConnected: true,
    category: "Comedy",
    secondaryCategories: ["Entertainment"],
    location: "Kollam",
    languages: ["Malayalam"],
    bio: "Sketches about Kerala office life.",
    about:
      "Branded sketch comedy with very high shareability. Strong for app launches and retail offers.",
    mainPlatform: "Instagram",
    followers: 520000,
    engagement: 6.9,
    startingPrice: 30000,
    responseRate: 64,
    lastActiveDays: 6,
    services: [
      { name: "Reel", price: 48000, turnaround: "8 days" },
      { name: "YouTube Short", price: 35000, turnaround: "7 days" },
      { name: "Event Appearance", price: 120000, turnaround: "On date" },
    ],
    socials: [
      { platform: "Instagram", handle: "@nikhilcomedy", followers: 520000, engagement: 6.9 },
      { platform: "YouTube", handle: "Nikhil Comedy", followers: 280000, engagement: 4.8 },
      { platform: "Facebook", handle: "Nikhil Varma", followers: 310000, engagement: 3.9 },
    ],
    portfolio: portfolioFor("nikhil"),
    audience: {
      female: 44,
      male: 56,
      topAge: "18-24",
      topCities: ["Kollam", "Thiruvananthapuram", "Kochi"],
      authenticity: 86,
    },
    collaborations: [{ brand: "Kerala Kart", work: "App launch sketch", year: 2025 }],
    testimonials: [
      { business: "Kerala Kart", quote: "1.2M organic views in four days.", rating: 5 },
    ],
    mediaKit: "nikhil-varma-mediakit.pdf",
  },
  {
    id: "c9",
    name: "Aiswarya Suresh",
    handle: "@aiswaryalens",
    avatar: face(20),
    cover: img("aiswarya-cover"),
    verified: false,
    socialConnected: true,
    category: "Photography",
    secondaryCategories: ["Travel", "Local creators"],
    location: "Alappuzha",
    languages: ["Malayalam", "English"],
    bio: "Backwater frames & product photography.",
    about:
      "Product and destination photography for homestays, resorts and handmade brands in the backwaters belt.",
    mainPlatform: "Instagram",
    followers: 47000,
    engagement: 7.8,
    startingPrice: 5000,
    responseRate: 92,
    lastActiveDays: 2,
    services: [
      { name: "Product Photography", price: 14000, turnaround: "6 days" },
      { name: "Post", price: 5000, turnaround: "3 days" },
      { name: "UGC", price: 7000, turnaround: "5 days" },
    ],
    socials: [
      { platform: "Instagram", handle: "@aiswaryalens", followers: 47000, engagement: 7.8 },
      { platform: "Pinterest", handle: "aiswaryalens", followers: 31000, engagement: 2.9 },
    ],
    portfolio: portfolioFor("aiswarya"),
    audience: {
      female: 57,
      male: 43,
      topAge: "25-34",
      topCities: ["Alappuzha", "Kochi", "Bengaluru"],
      authenticity: 94,
    },
    collaborations: [{ brand: "Punnamada Houseboats", work: "Photo set", year: 2025 }],
    testimonials: [
      {
        business: "Punnamada Houseboats",
        quote: "Our booking page finally looks premium.",
        rating: 5,
      },
    ],
    mediaKit: "aiswarya-suresh-mediakit.pdf",
  },
  {
    id: "c10",
    name: "Hari Sankar",
    handle: "@harigamerml",
    avatar: face(68),
    cover: img("hari-cover"),
    verified: true,
    socialConnected: true,
    category: "Gaming",
    secondaryCategories: ["Entertainment"],
    location: "Palakkad",
    languages: ["Malayalam", "Tamil"],
    bio: "Malayalam gaming streams, nightly.",
    about: "Live gaming streams and mobile game reviews with a loyal young Kerala audience.",
    mainPlatform: "Twitch",
    followers: 96000,
    engagement: 5.9,
    startingPrice: 9000,
    responseRate: 78,
    lastActiveDays: 1,
    services: [
      { name: "YouTube Video", price: 26000, turnaround: "9 days" },
      { name: "YouTube Short", price: 12000, turnaround: "4 days" },
      { name: "Product Review", price: 20000, turnaround: "8 days" },
    ],
    socials: [
      { platform: "Twitch", handle: "harigamerml", followers: 96000, engagement: 5.9 },
      { platform: "YouTube", handle: "Hari Gamer ML", followers: 210000, engagement: 4.0 },
      { platform: "Snapchat", handle: "harigamer", followers: 15000, engagement: 2.1 },
    ],
    portfolio: portfolioFor("hari"),
    audience: {
      female: 18,
      male: 82,
      topAge: "13-17",
      topCities: ["Palakkad", "Thrissur", "Coimbatore"],
      authenticity: 84,
    },
    collaborations: [{ brand: "Level Up Cafe", work: "Stream takeover", year: 2025 }],
    testimonials: [
      { business: "Level Up Cafe", quote: "Packed the cafe on a weekday.", rating: 4 },
    ],
    mediaKit: "hari-sankar-mediakit.pdf",
  },
  {
    id: "c11",
    name: "Meera Jayan",
    handle: "@meerabizmalayalam",
    avatar: face(44),
    cover: img("meera-cover"),
    verified: true,
    socialConnected: true,
    category: "Business",
    secondaryCategories: ["Education"],
    location: "Ernakulam (Kochi)",
    languages: ["Malayalam", "English", "Hindi"],
    bio: "Small business growth in Malayalam.",
    about:
      "Business explainers for Kerala SMEs. Ideal for B2B services, fintech and professional brands.",
    mainPlatform: "LinkedIn",
    followers: 73000,
    engagement: 4.9,
    startingPrice: 14000,
    responseRate: 90,
    lastActiveDays: 3,
    services: [
      { name: "Post", price: 14000, turnaround: "4 days" },
      { name: "Reel", price: 20000, turnaround: "6 days" },
      { name: "Event Appearance", price: 60000, turnaround: "On date" },
    ],
    socials: [
      { platform: "LinkedIn", handle: "Meera Jayan", followers: 73000, engagement: 4.9 },
      { platform: "Instagram", handle: "@meerabiz", followers: 58000, engagement: 5.2 },
    ],
    portfolio: portfolioFor("meera"),
    audience: {
      female: 39,
      male: 61,
      topAge: "35-44",
      topCities: ["Kochi", "Thiruvananthapuram", "Bengaluru"],
      authenticity: 92,
    },
    collaborations: [{ brand: "Kerala Startup Mission", work: "Panel + content", year: 2025 }],
    testimonials: [
      { business: "FinEdge Kochi", quote: "Very high quality leads from one post.", rating: 5 },
    ],
    mediaKit: "meera-jayan-mediakit.pdf",
  },
  {
    id: "c12",
    name: "Irfan Ali",
    handle: "@irfanmalabareats",
    avatar: face(13),
    cover: img("irfan-cover"),
    verified: false,
    socialConnected: false,
    category: "Food",
    secondaryCategories: ["Local creators"],
    location: "Malappuram",
    languages: ["Malayalam"],
    bio: "Malabar biryani hunter.",
    about:
      "Street food and Malabar cuisine coverage with strong district-level reach. Great for restaurant openings.",
    mainPlatform: "Instagram",
    followers: 121000,
    engagement: 7.5,
    startingPrice: 7000,
    responseRate: 86,
    lastActiveDays: 1,
    services: [
      { name: "Reel", price: 11000, turnaround: "4 days" },
      { name: "Story", price: 4000, turnaround: "1 day" },
      { name: "Event Appearance", price: 28000, turnaround: "On date" },
    ],
    socials: [
      { platform: "Instagram", handle: "@irfanmalabareats", followers: 121000, engagement: 7.5 },
      { platform: "Facebook", handle: "Malabar Eats", followers: 88000, engagement: 4.2 },
    ],
    portfolio: portfolioFor("irfan"),
    audience: {
      female: 47,
      male: 53,
      topAge: "18-24",
      topCities: ["Malappuram", "Kozhikode", "Sharjah"],
      authenticity: 90,
    },
    collaborations: [{ brand: "Paragon Style Kitchen", work: "Opening reel", year: 2025 }],
    testimonials: [
      { business: "Zam Zam Restaurant", quote: "Queue outside on day one.", rating: 5 },
    ],
    mediaKit: "irfan-ali-mediakit.pdf",
  },
];

/* Kerala = one sample/demo market. Prices in INR. */
const KERALA_CITY: Record<string, string> = { "Ernakulam (Kochi)": "Kochi", Wayanad: "Kalpetta" };

function globalCreator(
  p: Pick<
    DemoCreator,
    | "id"
    | "name"
    | "handle"
    | "category"
    | "bio"
    | "mainPlatform"
    | "followers"
    | "engagement"
    | "startingPrice"
  > & {
    face: number;
    city: string;
    currency: CurrencyCode;
    languages: Language[];
    secondary: Category[];
    platforms: Platform[];
    serviceAreas: string[];
    brands: string[];
  },
): Creator {
  const geo = geoForCity(p.city);
  const sp = p.startingPrice;
  return {
    id: p.id,
    name: p.name,
    handle: p.handle,
    avatar: face(p.face),
    cover: img(`${p.id}-cover`),
    verified: true,
    socialConnected: true,
    category: p.category,
    secondaryCategories: p.secondary,
    location: `${geo.city}, ${geo.country}`,
    languages: p.languages,
    bio: p.bio,
    about: `${p.bio} Works with local and international brands across ${p.serviceAreas.join(", ")}.`,
    mainPlatform: p.mainPlatform,
    followers: p.followers,
    engagement: p.engagement,
    startingPrice: sp,
    responseRate: 88,
    lastActiveDays: 2,
    services: [
      { name: "Reel", price: Math.round(sp * 1.5), turnaround: "5 days" },
      { name: "Post", price: sp, turnaround: "3 days" },
      { name: "Story", price: Math.round(sp * 0.5), turnaround: "1 day" },
      { name: "UGC", price: Math.round(sp * 1.2), turnaround: "6 days" },
    ],
    socials: p.platforms.map((platform, i) => ({
      platform,
      handle: p.handle,
      followers: Math.round(p.followers / (i + 1) / (i ? 2 : 1)),
      engagement: +(p.engagement - i * 0.8).toFixed(1),
    })),
    portfolio: portfolioFor(p.id),
    audience: {
      female: 58,
      male: 42,
      topAge: "25-34",
      topCities: p.serviceAreas.slice(0, 3),
      authenticity: 91,
    },
    collaborations: p.brands.map((brand, i) => ({
      brand,
      work: i ? "Campaign content" : "Launch series",
      year: 2025 - i,
    })),
    testimonials: [
      {
        business: p.brands[0] ?? "Brand partner",
        quote: "Clear communication and content that converted.",
        rating: 5,
      },
    ],
    mediaKit: `${p.id}-mediakit.pdf`,
    geo,
    currency: p.currency,
    serviceAreas: p.serviceAreas,
    remote: true,
    travel: true,
  };
}

const demoGlobalCreators: Creator[] = [
  globalCreator({
    id: "c13",
    name: "Layla Haddad",
    handle: "@layla.wears",
    face: 47,
    city: "Dubai",
    currency: "AED",
    category: "Fashion",
    secondary: ["Lifestyle", "Beauty"],
    languages: ["Arabic", "English"],
    bio: "Modest fashion and Gulf street style.",
    mainPlatform: "Instagram",
    platforms: ["Instagram", "TikTok"],
    followers: 412000,
    engagement: 4.8,
    startingPrice: 3500,
    serviceAreas: ["Dubai", "Abu Dhabi", "Sharjah", "Remote / Worldwide"],
    brands: ["Dubai Mall Style Week", "Namshi"],
  }),
  globalCreator({
    id: "c14",
    name: "Oliver Grant",
    handle: "@olivereatslondon",
    face: 59,
    city: "London",
    currency: "GBP",
    category: "Food",
    secondary: ["Lifestyle"],
    languages: ["English"],
    bio: "Hidden London food spots in 60 seconds.",
    mainPlatform: "TikTok",
    platforms: ["TikTok", "Instagram", "YouTube"],
    followers: 268000,
    engagement: 5.9,
    startingPrice: 650,
    serviceAreas: ["London", "Manchester", "Remote / Worldwide"],
    brands: ["Borough Bites", "Deliveroo"],
  }),
  globalCreator({
    id: "c15",
    name: "Maya Chen",
    handle: "@mayabuilds",
    face: 44,
    city: "New York",
    currency: "USD",
    category: "Technology",
    secondary: ["Business", "Education"],
    languages: ["English", "Mandarin"],
    bio: "Gadget reviews and startup tools for creators.",
    mainPlatform: "YouTube",
    platforms: ["YouTube", "X", "LinkedIn"],
    followers: 530000,
    engagement: 4.2,
    startingPrice: 2400,
    serviceAreas: ["New York", "Los Angeles", "Remote / Worldwide"],
    brands: ["Notion", "Anker"],
  }),
  globalCreator({
    id: "c16",
    name: "Arjun Nair",
    handle: "@arjunlifts.sg",
    face: 15,
    city: "Singapore",
    currency: "SGD",
    category: "Fitness",
    secondary: ["Lifestyle", "Sports"],
    languages: ["English", "Malayalam", "Tamil"],
    bio: "Hybrid training and healthy hawker picks.",
    mainPlatform: "Instagram",
    platforms: ["Instagram", "YouTube"],
    followers: 145000,
    engagement: 6.8,
    startingPrice: 900,
    serviceAreas: ["Singapore", "Kochi", "Remote / Worldwide"],
    brands: ["Decathlon SG", "Grab"],
  }),
  globalCreator({
    id: "c17",
    name: "Sofia Rossi",
    handle: "@sofiaglow",
    face: 32,
    city: "Toronto",
    currency: "CAD",
    category: "Beauty",
    secondary: ["Fashion"],
    languages: ["English", "Spanish"],
    bio: "Clean beauty for every skin tone.",
    mainPlatform: "Instagram",
    platforms: ["Instagram", "Pinterest"],
    followers: 198000,
    engagement: 5.1,
    startingPrice: 1100,
    serviceAreas: ["Toronto", "Remote / Worldwide"],
    brands: ["Sephora Canada", "The Ordinary"],
  }),
  globalCreator({
    id: "c18",
    name: "Camille Laurent",
    handle: "@camille.voyage",
    face: 26,
    city: "Paris",
    currency: "EUR",
    category: "Travel",
    secondary: ["Photography", "Lifestyle"],
    languages: ["French", "English"],
    bio: "Slow travel across Europe, one train at a time.",
    mainPlatform: "Instagram",
    platforms: ["Instagram", "YouTube"],
    followers: 322000,
    engagement: 4.6,
    startingPrice: 1800,
    serviceAreas: ["Paris", "Europe", "Remote / Worldwide"],
    brands: ["SNCF Connect", "Airbnb"],
  }),
];

export const creators: Creator[] = [
  ...demoKeralaCreators.map((c): Creator => {
    const geo = geoForCity(KERALA_CITY[c.location] ?? c.location);
    return {
      ...c,
      location: `${geo.city}, ${geo.region}, ${geo.country}`,
      geo,
      currency: "INR",
      serviceAreas: [geo.city, "Kerala", "Remote / Worldwide"],
      remote: true,
      travel: c.followers > 100000,
    };
  }),
  ...demoGlobalCreators,
];

export const creatorById = (id: string) => creators.find((c) => c.id === id);

/* ---------------- Business ---------------- */

export interface Business {
  id: string;
  name: string;
  logo: string;
  type: string;
  description: string;
  website: string;
  location: string;
  contactPerson: string;
  email: string;
  phone: string;
  categories: Category[];
  socials: { platform: Platform; handle: string }[];
  plan: "Free" | "Business Pro" | "Agency";
  currency: CurrencyCode;
  /** A business can operate in many cities/countries. */
  operatingLocations: { label: string; radiusKm: number }[];
}

export const currentBusiness: Business = {
  currency: "INR",
  operatingLocations: [
    { label: "Kochi, Kerala, India", radiusKm: 40 },
    { label: "Kozhikode, Kerala, India", radiusKm: 25 },
    { label: "Dubai, United Arab Emirates", radiusKm: 30 },
  ],
  id: "b1",
  name: "Kadal Spice Restaurants",
  logo: img("kadal-logo"),
  type: "Restaurant chain",
  description:
    "A five-outlet Kerala seafood restaurant group based in Kochi, serving coastal Malabar and Travancore cuisine since 2016.",
  website: "https://kadalspice.example.com",
  location: "Ernakulam (Kochi)",
  contactPerson: "Rehan Abdulla",
  email: "marketing@kadalspice.example.com",
  phone: "+91 98470 00000",
  categories: ["Food", "Lifestyle", "Local creators"],
  socials: [
    { platform: "Instagram", handle: "@kadalspice" },
    { platform: "Facebook", handle: "Kadal Spice" },
  ],
  plan: "Business Pro",
};

export const otherBusinesses = [
  { id: "b2", name: "Calicut Silks", type: "Fashion store", location: "Kozhikode" },
  { id: "b3", name: "Vythiri Meadows Resort", type: "Travel business", location: "Wayanad" },
  { id: "b4", name: "Ayur Leaf Naturals", type: "Beauty brand", location: "Thrissur" },
  { id: "b5", name: "Kerala Kart", type: "Startup", location: "Thiruvananthapuram" },
  { id: "b6", name: "Onam Fest Events", type: "Event organizer", location: "Ernakulam (Kochi)" },
  { id: "b7", name: "Brandwave Agency", type: "Marketing agency", location: "Ernakulam (Kochi)" },
];

/* ---------------- Dashboard ---------------- */

export const dashboardStats = [
  { label: "Influencers Contacted", value: 148, change: "+12 this week", tone: "primary" as const },
  { label: "Active Campaigns", value: 4, change: "2 ending soon", tone: "accent" as const },
  { label: "Shortlisted Creators", value: 37, change: "+6 this week", tone: "primary" as const },
  { label: "Pending Responses", value: 19, change: "9 over 3 days", tone: "warning" as const },
];

/* ---------------- Shortlists ---------------- */

export interface ShortlistEntry {
  creatorId: string;
  note: string;
  tags: string[];
  contactStatus: "Not contacted" | "Contacted" | "Responded" | "Negotiating" | "Booked";
}

export interface Shortlist {
  id: string;
  name: string;
  description: string;
  campaign?: string;
  updated: string;
  entries: ShortlistEntry[];
}

export const shortlists: Shortlist[] = [
  {
    id: "s1",
    name: "Restaurant Campaign",
    description: "Creators for the Marine Drive outlet relaunch.",
    campaign: "Kadal Spice Monsoon Menu",
    updated: "2 hours ago",
    entries: [
      {
        creatorId: "c1",
        note: "Best fit — audience overlaps with our Kochi diners.",
        tags: ["Priority", "Kochi"],
        contactStatus: "Negotiating",
      },
      {
        creatorId: "c12",
        note: "Great for the Calicut outlet phase two.",
        tags: ["Malabar"],
        contactStatus: "Contacted",
      },
      {
        creatorId: "c5",
        note: "Could cover the dessert line.",
        tags: ["Budget friendly"],
        contactStatus: "Not contacted",
      },
    ],
  },
  {
    id: "s2",
    name: "Kerala Food Creators",
    description: "Evergreen bench of food creators across districts.",
    updated: "Yesterday",
    entries: [
      { creatorId: "c1", note: "Anchor creator.", tags: ["Anchor"], contactStatus: "Booked" },
      { creatorId: "c12", note: "Strong Malabar reach.", tags: [], contactStatus: "Responded" },
    ],
  },
  {
    id: "s3",
    name: "Fashion Campaign",
    description: "For the merchandise line launch.",
    campaign: "Kadal Merch Drop",
    updated: "3 days ago",
    entries: [
      {
        creatorId: "c3",
        note: "Festive styling angle.",
        tags: ["Premium"],
        contactStatus: "Contacted",
      },
      { creatorId: "c5", note: "Beauty crossover.", tags: [], contactStatus: "Not contacted" },
    ],
  },
  {
    id: "s4",
    name: "Event Promotion",
    description: "Onam food festival hosts and performers.",
    updated: "5 days ago",
    entries: [
      { creatorId: "c8", note: "Sketch + host.", tags: ["Host"], contactStatus: "Responded" },
      { creatorId: "c6", note: "Fitness zone partner.", tags: [], contactStatus: "Not contacted" },
    ],
  },
  {
    id: "s5",
    name: "Potential Long-Term Creators",
    description: "Retainer candidates for 2026.",
    updated: "Last week",
    entries: [
      {
        creatorId: "c9",
        note: "Monthly product photography.",
        tags: ["Retainer"],
        contactStatus: "Contacted",
      },
      { creatorId: "c11", note: "B2B franchise story.", tags: [], contactStatus: "Not contacted" },
    ],
  },
];

/* ---------------- Requirements ---------------- */

export interface Requirement {
  id: string;
  title: string;
  description: string;
  category: Category;
  location: string;
  language: Language;
  platforms: Platform[];
  creatorsNeeded: number;
  minFollowers: number;
  minEngagement: number;
  deliverables: ServiceName[];
  budget: number;
  startDate: string;
  deadline: string;
  instructions: string;
  status: "Published" | "Draft" | "Closed";
  applications: number;
  matches: { creatorId: string; match: number }[];
}

export const requirements: Requirement[] = [
  {
    id: "r1",
    title: "Monsoon seafood menu launch — Kochi food creators",
    description:
      "We are launching a limited monsoon menu at our Marine Drive outlet and want honest, appetising coverage from Kochi food creators with a local dining audience.",
    category: "Food",
    location: "Ernakulam (Kochi)",
    language: "Malayalam",
    platforms: ["Instagram", "YouTube"],
    creatorsNeeded: 5,
    minFollowers: 50000,
    minEngagement: 4,
    deliverables: ["Reel", "Story", "Product Review"],
    budget: 250000,
    startDate: "2026-10-05",
    deadline: "2026-10-28",
    instructions:
      "Visit between 12pm and 4pm on weekdays. Tag @kadalspice and use #KadalMonsoon. Two rounds of revisions allowed.",
    status: "Published",
    applications: 23,
    matches: [
      { creatorId: "c1", match: 92 },
      { creatorId: "c12", match: 87 },
      { creatorId: "c5", match: 81 },
      { creatorId: "c9", match: 74 },
    ],
  },
  {
    id: "r2",
    title: "Onam food festival hosts",
    description:
      "Looking for entertaining creators to host and cover our three-day Onam sadya festival across two outlets.",
    category: "Entertainment",
    location: "Ernakulam (Kochi)",
    language: "Malayalam",
    platforms: ["Instagram", "Facebook"],
    creatorsNeeded: 2,
    minFollowers: 200000,
    minEngagement: 5,
    deliverables: ["Event Appearance", "Reel", "Story"],
    budget: 400000,
    startDate: "2026-08-20",
    deadline: "2026-09-02",
    instructions: "Full day presence required. Travel and stay covered.",
    status: "Published",
    applications: 11,
    matches: [
      { creatorId: "c8", match: 95 },
      { creatorId: "c1", match: 78 },
      { creatorId: "c6", match: 66 },
    ],
  },
  {
    id: "r3",
    title: "UGC pack for delivery app listing",
    description: "Short vertical UGC clips of signature dishes for our delivery listings and ads.",
    category: "Food",
    location: "Thrissur",
    language: "Malayalam",
    platforms: ["Instagram"],
    creatorsNeeded: 4,
    minFollowers: 10000,
    minEngagement: 6,
    deliverables: ["UGC", "Product Photography"],
    budget: 90000,
    startDate: "2026-10-12",
    deadline: "2026-11-05",
    instructions: "Raw files required. No creator face necessary.",
    status: "Draft",
    applications: 0,
    matches: [
      { creatorId: "c5", match: 88 },
      { creatorId: "c9", match: 85 },
      { creatorId: "c7", match: 69 },
    ],
  },
];

/* ---------------- Campaigns ---------------- */

export type CampaignStatus =
  | "Draft"
  | "Published"
  | "Applications"
  | "Shortlisted"
  | "Invited"
  | "Accepted"
  | "In Progress"
  | "Content Submitted"
  | "Approved"
  | "Completed"
  | "Cancelled";

export const CAMPAIGN_STATUSES: CampaignStatus[] = [
  "Draft",
  "Published",
  "Applications",
  "Shortlisted",
  "Invited",
  "Accepted",
  "In Progress",
  "Content Submitted",
  "Approved",
  "Completed",
  "Cancelled",
];

export interface CampaignCreator {
  creatorId: string;
  status: CampaignStatus;
  deliverables: ServiceName[];
  budget: number;
  payment: "Unpaid" | "Advance paid" | "Paid";
}

export interface Deliverable {
  id: string;
  creatorId: string;
  type: ServiceName;
  required: number;
  submitted: number;
  approval: "Pending" | "Submitted" | "Approved" | "Changes requested";
  deadline: string;
}

export interface Campaign {
  id: string;
  name: string;
  category: Category;
  status: CampaignStatus;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  progress: number;
  brief: string;
  creators: CampaignCreator[];
  deliverables: Deliverable[];
  metrics: { reach: number; impressions: number; engagements: number; clicks: number; cpe: number };
  weekly: { week: string; reach: number; engagement: number }[];
}

export const campaigns: Campaign[] = [
  {
    id: "cmp1",
    name: "Kadal Spice Monsoon Menu",
    category: "Food",
    status: "In Progress",
    budget: 250000,
    spent: 148000,
    startDate: "2026-09-05",
    endDate: "2026-10-15",
    progress: 62,
    brief:
      "Drive weekday footfall to the Marine Drive outlet during monsoon with honest food reviews and reels from Kochi creators.",
    creators: [
      {
        creatorId: "c1",
        status: "Content Submitted",
        deliverables: ["Reel", "Story"],
        budget: 24000,
        payment: "Advance paid",
      },
      {
        creatorId: "c12",
        status: "In Progress",
        deliverables: ["Reel"],
        budget: 11000,
        payment: "Unpaid",
      },
      {
        creatorId: "c5",
        status: "Accepted",
        deliverables: ["UGC", "Story"],
        budget: 12000,
        payment: "Unpaid",
      },
    ],
    deliverables: [
      {
        id: "d1",
        creatorId: "c1",
        type: "Reel",
        required: 2,
        submitted: 2,
        approval: "Submitted",
        deadline: "2026-09-28",
      },
      {
        id: "d2",
        creatorId: "c1",
        type: "Story",
        required: 3,
        submitted: 3,
        approval: "Approved",
        deadline: "2026-09-22",
      },
      {
        id: "d3",
        creatorId: "c12",
        type: "Reel",
        required: 1,
        submitted: 1,
        approval: "Changes requested",
        deadline: "2026-10-02",
      },
      {
        id: "d4",
        creatorId: "c5",
        type: "UGC",
        required: 4,
        submitted: 0,
        approval: "Pending",
        deadline: "2026-10-10",
      },
    ],
    metrics: { reach: 812000, impressions: 1240000, engagements: 68400, clicks: 12400, cpe: 2.2 },
    weekly: [
      { week: "W1", reach: 92000, engagement: 5400 },
      { week: "W2", reach: 168000, engagement: 12100 },
      { week: "W3", reach: 241000, engagement: 19800 },
      { week: "W4", reach: 311000, engagement: 31100 },
    ],
  },
  {
    id: "cmp2",
    name: "Onam Sadya Festival",
    category: "Entertainment",
    status: "Completed",
    budget: 400000,
    spent: 386500,
    startDate: "2026-08-18",
    endDate: "2026-09-02",
    progress: 100,
    brief: "Three-day Onam sadya festival coverage with creator hosts across two outlets.",
    creators: [
      {
        creatorId: "c8",
        status: "Completed",
        deliverables: ["Event Appearance", "Reel"],
        budget: 168000,
        payment: "Paid",
      },
      {
        creatorId: "c1",
        status: "Completed",
        deliverables: ["Reel", "Story"],
        budget: 30000,
        payment: "Paid",
      },
    ],
    deliverables: [
      {
        id: "d5",
        creatorId: "c8",
        type: "Reel",
        required: 2,
        submitted: 2,
        approval: "Approved",
        deadline: "2026-08-30",
      },
      {
        id: "d6",
        creatorId: "c1",
        type: "Reel",
        required: 1,
        submitted: 1,
        approval: "Approved",
        deadline: "2026-08-29",
      },
    ],
    metrics: { reach: 1940000, impressions: 3120000, engagements: 174000, clicks: 28600, cpe: 2.2 },
    weekly: [
      { week: "W1", reach: 420000, engagement: 38000 },
      { week: "W2", reach: 760000, engagement: 62000 },
      { week: "W3", reach: 760000, engagement: 74000 },
      { week: "W4", reach: 0, engagement: 0 },
    ],
  },
  {
    id: "cmp3",
    name: "Kadal Merch Drop",
    category: "Fashion",
    status: "Applications",
    budget: 180000,
    spent: 0,
    startDate: "2026-10-20",
    endDate: "2026-11-30",
    progress: 12,
    brief: "Launch the limited Kadal Spice apparel line with fashion and lifestyle creators.",
    creators: [
      {
        creatorId: "c3",
        status: "Invited",
        deliverables: ["Reel", "Post"],
        budget: 39000,
        payment: "Unpaid",
      },
      {
        creatorId: "c5",
        status: "Applications",
        deliverables: ["Reel"],
        budget: 12000,
        payment: "Unpaid",
      },
    ],
    deliverables: [
      {
        id: "d7",
        creatorId: "c3",
        type: "Reel",
        required: 2,
        submitted: 0,
        approval: "Pending",
        deadline: "2026-11-15",
      },
    ],
    metrics: { reach: 0, impressions: 0, engagements: 0, clicks: 0, cpe: 0 },
    weekly: [
      { week: "W1", reach: 0, engagement: 0 },
      { week: "W2", reach: 0, engagement: 0 },
      { week: "W3", reach: 0, engagement: 0 },
      { week: "W4", reach: 0, engagement: 0 },
    ],
  },
  {
    id: "cmp4",
    name: "Franchise Investor Outreach",
    category: "Business",
    status: "Draft",
    budget: 120000,
    spent: 0,
    startDate: "2026-11-01",
    endDate: "2026-12-15",
    progress: 0,
    brief: "B2B content series to attract franchise partners across Kerala.",
    creators: [
      {
        creatorId: "c11",
        status: "Draft",
        deliverables: ["Post", "Reel"],
        budget: 34000,
        payment: "Unpaid",
      },
    ],
    deliverables: [],
    metrics: { reach: 0, impressions: 0, engagements: 0, clicks: 0, cpe: 0 },
    weekly: [
      { week: "W1", reach: 0, engagement: 0 },
      { week: "W2", reach: 0, engagement: 0 },
      { week: "W3", reach: 0, engagement: 0 },
      { week: "W4", reach: 0, engagement: 0 },
    ],
  },
];

export const campaignById = (id: string) => campaigns.find((c) => c.id === id);

/* ---------------- Content approval ---------------- */

export interface ContentSubmission {
  id: string;
  campaignId: string;
  creatorId: string;
  type: ServiceName;
  preview: string;
  submitted: string;
  caption: string;
  status: "Pending review" | "Approved" | "Changes requested" | "Rejected";
}

export const submissions: ContentSubmission[] = [
  {
    id: "sub1",
    campaignId: "cmp1",
    creatorId: "c1",
    type: "Reel",
    preview: img("sub1"),
    submitted: "2026-09-26",
    caption:
      "Monsoon at Marine Drive hits different with Kadal Spice's new karimeen pollichathu 🌧️ #KadalMonsoon",
    status: "Pending review",
  },
  {
    id: "sub2",
    campaignId: "cmp1",
    creatorId: "c12",
    type: "Reel",
    preview: img("sub2"),
    submitted: "2026-09-25",
    caption: "Malabar meets the backwaters — full review of the new monsoon menu.",
    status: "Changes requested",
  },
  {
    id: "sub3",
    campaignId: "cmp1",
    creatorId: "c1",
    type: "Story",
    preview: img("sub3"),
    submitted: "2026-09-21",
    caption: "Swipe up for the monsoon combo, available till October 15.",
    status: "Approved",
  },
  {
    id: "sub4",
    campaignId: "cmp2",
    creatorId: "c8",
    type: "Reel",
    preview: img("sub4"),
    submitted: "2026-08-29",
    caption: "When your whole office fights over the last pappadam. #OnamAtKadal",
    status: "Approved",
  },
];

/* ---------------- Messages ---------------- */

export interface Message {
  id: string;
  from: "business" | "creator";
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  creatorId: string;
  campaign?: string;
  unread: number;
  lastTime: string;
  messages: Message[];
}

export const conversations: Conversation[] = [
  {
    id: "cv1",
    creatorId: "c1",
    campaign: "Kadal Spice Monsoon Menu",
    unread: 2,
    lastTime: "09:42",
    messages: [
      {
        id: "m1",
        from: "business",
        text: "Hi Anjali, the monsoon menu shoot is confirmed for Friday 1pm.",
        time: "Mon 10:12",
      },
      {
        id: "m2",
        from: "creator",
        text: "Perfect. Can I bring my camera assistant?",
        time: "Mon 10:30",
      },
      {
        id: "m3",
        from: "business",
        text: "Of course. We'll reserve the corner table by the window.",
        time: "Mon 10:34",
      },
      {
        id: "m4",
        from: "creator",
        text: "Uploaded the first reel draft to the campaign for review 🙌",
        time: "09:40",
      },
      {
        id: "m5",
        from: "creator",
        text: "Let me know about the caption — happy to adjust the hashtags.",
        time: "09:42",
      },
    ],
  },
  {
    id: "cv2",
    creatorId: "c3",
    campaign: "Kadal Merch Drop",
    unread: 1,
    lastTime: "Yesterday",
    messages: [
      {
        id: "m6",
        from: "business",
        text: "Hi Fathima, we'd love you for our merch launch in November.",
        time: "Yesterday 16:02",
      },
      {
        id: "m7",
        from: "creator",
        text: "Sounds interesting! Could you share the deliverables and budget?",
        time: "Yesterday 18:20",
      },
    ],
  },
  {
    id: "cv3",
    creatorId: "c12",
    campaign: "Kadal Spice Monsoon Menu",
    unread: 0,
    lastTime: "Tue",
    messages: [
      {
        id: "m8",
        from: "business",
        text: "Irfan, could you re-cut the intro to include the outlet name?",
        time: "Tue 11:00",
      },
      {
        id: "m9",
        from: "creator",
        text: "Sure, sending a revised version by Thursday.",
        time: "Tue 11:26",
      },
    ],
  },
  {
    id: "cv4",
    creatorId: "c8",
    campaign: "Onam Sadya Festival",
    unread: 0,
    lastTime: "Sep 3",
    messages: [
      {
        id: "m10",
        from: "business",
        text: "Numbers looked fantastic. Thank you Nikhil!",
        time: "Sep 3 09:00",
      },
      {
        id: "m11",
        from: "creator",
        text: "Anytime. Let's do the Christmas edition 🎄",
        time: "Sep 3 09:15",
      },
    ],
  },
  {
    id: "cv5",
    creatorId: "c9",
    unread: 0,
    lastTime: "Aug 28",
    messages: [
      {
        id: "m12",
        from: "business",
        text: "Are you open to a monthly product photography retainer?",
        time: "Aug 28 14:10",
      },
    ],
  },
];

export const messageTemplates = [
  {
    label: "Collaboration inquiry",
    text: "Hi! We're Kadal Spice Restaurants in Kochi. We loved your recent work and would like to explore a collaboration. Are you available this month?",
  },
  {
    label: "Price request",
    text: "Could you share your current rates for a reel plus two stories, including usage rights for paid promotion?",
  },
  {
    label: "Campaign invitation",
    text: "We'd like to invite you to our upcoming campaign. Deliverables, budget and timelines are in the campaign brief — let us know if you're interested.",
  },
  {
    label: "Revision request",
    text: "Thanks for the submission! Could you adjust the opening three seconds to include the outlet name and re-upload?",
  },
];

/* ---------------- Saved searches ---------------- */

export interface SavedSearch {
  id: string;
  name: string;
  categories: Category[];
  locations: string[];
  languages: Language[];
  platforms: Platform[];
  followers: [number, number];
  minEngagement: number;
  budget: [number, number];
  newMatches: number;
  notify: boolean;
}

export const savedSearches: SavedSearch[] = [
  {
    id: "ss1",
    name: "Malayalam Food Creators — Kerala",
    categories: ["Food"],
    locations: ["Ernakulam (Kochi)", "Thrissur", "Malappuram"],
    languages: ["Malayalam"],
    platforms: ["Instagram"],
    followers: [50000, 300000],
    minEngagement: 5,
    budget: [5000, 30000],
    newMatches: 6,
    notify: true,
  },
  {
    id: "ss2",
    name: "High engagement micro creators",
    categories: ["Beauty", "Lifestyle", "Parenting"],
    locations: ["Thrissur", "Kottayam"],
    languages: ["Malayalam", "English"],
    platforms: ["Instagram"],
    followers: [10000, 100000],
    minEngagement: 7,
    budget: [3000, 15000],
    newMatches: 3,
    notify: true,
  },
  {
    id: "ss3",
    name: "Event hosts — Kochi",
    categories: ["Comedy", "Entertainment"],
    locations: ["Ernakulam (Kochi)", "Kollam"],
    languages: ["Malayalam"],
    platforms: ["Instagram", "YouTube"],
    followers: [200000, 1000000],
    minEngagement: 4,
    budget: [50000, 200000],
    newMatches: 0,
    notify: false,
  },
];

/* ---------------- Notifications ---------------- */

export interface AppNotification {
  id: string;
  type:
    | "invitation"
    | "application"
    | "message"
    | "deadline"
    | "submitted"
    | "approved"
    | "match"
    | "requirement";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export const notifications: AppNotification[] = [
  {
    id: "n1",
    type: "invitation",
    title: "Fathima Rasheed accepted your invitation",
    body: "Kadal Merch Drop — she's ready to discuss deliverables.",
    time: "12 min ago",
    read: false,
  },
  {
    id: "n2",
    type: "submitted",
    title: "New content submitted",
    body: "Anjali Menon submitted a reel for Kadal Spice Monsoon Menu.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "n3",
    type: "application",
    title: "3 new creator applications",
    body: "Monsoon seafood menu launch requirement.",
    time: "3 hours ago",
    read: false,
  },
  {
    id: "n4",
    type: "message",
    title: "New message from Irfan Ali",
    body: "Sending a revised version by Thursday.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "n5",
    type: "deadline",
    title: "Deadline in 2 days",
    body: "Sneha Krishnan's UGC pack is due on 10 October.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "n6",
    type: "approved",
    title: "Content approved",
    body: "You approved 3 stories from Anjali Menon.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "n7",
    type: "match",
    title: "6 new matching creators",
    body: "Saved search: Malayalam Food Creators — Kerala.",
    time: "3 days ago",
    read: true,
  },
  {
    id: "n8",
    type: "requirement",
    title: "Requirement response",
    body: "Aiswarya Suresh responded to your UGC pack requirement.",
    time: "4 days ago",
    read: true,
  },
];

/* ---------------- Subscription ---------------- */

export const plans = [
  {
    name: "Free",
    price: 0,
    currency: "INR" as CurrencyCode,
    period: "forever",
    description: "Explore the marketplace and test the waters.",
    features: [
      "Basic creator discovery",
      "2 shortlists",
      "10 inquiries per month",
      "1 active requirement",
      "Community support",
    ],
    cta: "Current plan",
    highlighted: false,
  },
  {
    name: "Business Pro",
    price: 2999,
    currency: "INR" as CurrencyCode,
    period: "per month",
    description: "For growing brands running regular campaigns.",
    features: [
      "Advanced filters & saved searches",
      "Unlimited shortlists",
      "500 inquiries per month",
      "Full campaign management",
      "Content approval workflow",
      "Performance analytics",
    ],
    cta: "Upgrade",
    highlighted: true,
  },
  {
    name: "Agency",
    price: 9999,
    currency: "INR" as CurrencyCode,
    period: "per month",
    description: "For agencies managing multiple client brands.",
    features: [
      "Everything in Business Pro",
      "Up to 10 team members",
      "Unlimited client workspaces",
      "Advanced campaign automation",
      "White-label reporting",
      "Dedicated account manager",
    ],
    cta: "Talk to sales",
    highlighted: false,
  },
];

/* ---------------- helpers ---------------- */

export const formatFollowers = (n: number) =>
  n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}K` : `${n}`;
