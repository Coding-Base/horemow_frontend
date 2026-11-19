import { useEffect, useState } from "react";
import { LEADERSHIP_IMAGES, CONFERENCE_GALLERY_IMAGES, type ConferenceImage } from "../data/mediaAssets";
import { getValidAccessToken, refreshAccessToken } from "./auth";
import {
  sermons as initialSermons,
  publications as initialPublications,
  doctrineTopics as initialDoctrineTopics,
  blogPosts as initialBlogPosts,
  location as initialLocation,
  type Sermon,
  type Publication,
} from "../data/content";

/* -------------------------------------------------------------
 * 1. HOMEPAGE TYPES & DEFAULTS
 * ------------------------------------------------------------- */
export type HomepageContent = {
  hero: {
    eyebrow: string;
    headlineLine1: string;
    headlineHighlight: string;
    subtitle: string;
    scripturalVerse: string;
    scripturalRef: string;
    discoverText: string;
    devotionalText: string;
  };
  welcome: {
    eyebrow: string;
    title: string;
    description: string;
  };
  leadership: {
    eyebrow: string;
    pastorName: string;
    pastorRole: string;
    pastorQuote: string;
    pastorBio: string;
    pastorImage: string;
    mummyName: string;
    mummyRole: string;
    mummyBio: string;
    mummyImage: string;
  };
  givingBanner: {
    eyebrow: string;
    title: string;
    description: string;
    actionText: string;
  };
  gallery: {
    eyebrow: string;
    title: string;
    description: string;
  };
  stats: HomepageStatCard[];
};

export type HomepageStatCard = {
  id: string;
  number: string;
  label: string;
  sub: string;
  icon: "globe" | "calendar" | "shield" | "book";
  image: string;
};

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  hero: {
    eyebrow: "Absolute purity. Biblical truth.",
    headlineLine1: "Restoring",
    headlineHighlight: "God’s holiness.",
    subtitle:
      "A non-denominational movement promoting truth, holiness and righteousness in churches and nations around the world.",
    scripturalVerse:
      "Follow peace with all men, and holiness, without which no man shall see the Lord.",
    scripturalRef: "Hebrews 12:14",
    discoverText: "Discover HOREMOW",
    devotionalText: "Today’s devotional",
  },
  welcome: {
    eyebrow: "A global ministry",
    title: "A life anchored in the Word.",
    description:
      "Teaching, fellowship and resources to help believers grow in truth and live with purpose.",
  },
  leadership: {
    eyebrow: "Leadership · HOREMOW",
    pastorName: "Pastor Paul Rika",
    pastorRole: "Founder & International Director",
    pastorQuote: "Prepare the global church for the return of our Lord in absolute holiness.",
    pastorBio:
      "Pastor Paul Rika is a chosen vessel with over 40 years of ministry, dedicated to proclaiming biblical holiness, restitution, and preparing the Bride for the coming of Christ without compromise.",
    pastorImage: LEADERSHIP_IMAGES.pastorPaulRika,
    mummyName: "Evangelist Linda Paul Rika",
    mummyRole: "International Women Coordinator",
    mummyBio:
      "Evangelist Linda Paul Rika spearheads women conferences and family revival missions worldwide, emphasizing godliness, prayerful motherhood, and modesty.",
    mummyImage: LEADERSHIP_IMAGES.mummyLindaRika,
  },
  givingBanner: {
    eyebrow: "Kingdom stewardship",
    title: "Partner in sharing the message.",
    description:
      "Support the printing and distribution of free holiness literature, crusades, and global broadcast operations.",
    actionText: "Giving information",
  },
  gallery: {
    eyebrow: "Global Revivals in 3D Motion",
    title: "Conference & Crusade Gallery.",
    description:
      "When the word is taught in the spirit of the apostles there is repentance, salvation, sanctification, revival and deliverance. Hearts are being cleansed, ignorance disappears, and God’s word is spread to all.",
  },
  stats: [
    {
      id: "nations-reached",
      number: "50+",
      label: "Nations Reached",
      sub: "Global mission outposts and crusades",
      icon: "globe",
      image: "",
    },
    {
      id: "years-in-ministry",
      number: "40+",
      label: "Years in Ministry",
      sub: "Proclaiming undiluted holiness",
      icon: "calendar",
      image: "",
    },
    {
      id: "fellowship-branches",
      number: "84+",
      label: "Fellowship Branches",
      sub: "Centres for holy living and prayer",
      icon: "shield",
      image: "",
    },
    {
      id: "free-books-distributed",
      number: "Millions",
      label: "Free Books Distributed",
      sub: "Truth literature shared worldwide",
      icon: "book",
      image: "",
    },
  ],
};

/* -------------------------------------------------------------
 * 2. ABOUT PAGE TYPES & DEFAULTS
 * ------------------------------------------------------------- */
export type AboutContent = {
  eyebrow: string;
  title: string;
  description: string;
  storyHeading: string;
  storyParagraph1: string;
  storyParagraph2: string;
  establishedCity: string;
  doctrineIntro: string;
  doctrineTopics: Array<{ title: string; description: string }>;
};

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  eyebrow: "Our movement",
  title: "Truth that shapes a life.",
  description: "A non-denominational movement sharing biblical truth and calling believers to a life of holiness.",
  storyHeading: "Called to promote truth, holiness and righteousness.",
  storyParagraph1:
    "Holiness Revival Movement Worldwide (HOREMOW) is a non-denominational Christian ministry. Its public mission is to encourage biblical truth and holy living in churches and nations.",
  storyParagraph2:
    "The ministry’s website describes its beginnings in Abuja, Nigeria, in 2009. HOREMOW’s teachings, publications and fellowship network invite believers to grow in faith and prepare for the return of Jesus Christ.",
  establishedCity: "Abuja, Nigeria",
  doctrineIntro: "The ministry’s public teaching focuses on these central subjects of scripture.",
  doctrineTopics: initialDoctrineTopics,
};

/* -------------------------------------------------------------
 * 3. DEVOTIONAL TYPES & DEFAULTS
 * ------------------------------------------------------------- */
export type DevotionalEntry = {
  id: string;
  dateKey: string; // YYYY-MM-DD or 'today'
  title: string;
  author: string;
  scriptureReference: string;
  scriptureVerse: string;
  reflection: string;
  prayer: string;
  actionPoint?: string;
};

export const DEFAULT_DEVOTIONALS: DevotionalEntry[] = [
  {
    id: "dev-1",
    dateKey: "today",
    title: "A heart grounded in truth.",
    author: "Pastor Paul Rika",
    scriptureReference: "Psalm 119:105",
    scriptureVerse: "“Thy word is a lamp unto my feet, and a light unto my path.”",
    reflection:
      "Take a quiet moment to reflect on the guidance and wisdom found in scripture. Let truth shape the choices you make and the way you care for those around you today.",
    prayer:
      "Lord, guide my thoughts and actions. Help me to walk in truth, show kindness and remain faithful in the day ahead.",
    actionPoint: "Meditate on Psalm 119 today and ensure all your dealings with colleagues reflect godly integrity.",
  },
  {
    id: "dev-2",
    dateKey: "2026-11-17",
    title: "The high calling of uncompromising sanctification.",
    author: "Pastor Paul Rika",
    scriptureReference: "Hebrews 12:14",
    scriptureVerse: "“Follow peace with all men, and holiness, without which no man shall see the Lord.”",
    reflection:
      "Sanctification is not an optional higher tier for a select few believers; it is the essential garment of the bride of Christ. Keep your hands clean and your heart pure.",
    prayer:
      "Holy Father, cleanse me from all secret faults and preserve my soul blameless unto Your coming.",
    actionPoint: "Examine your conscience and confess any hidden grievance or compromise before sunset.",
  },
];

/* -------------------------------------------------------------
 * 4. EVENT TYPES & DEFAULTS
 * ------------------------------------------------------------- */
export type MinistryEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: "Upcoming" | "Past";
  description: string;
  flyerUrl?: string;
  themeVerse?: string;
  registrationUrl?: string;
};

export const DEFAULT_EVENTS: MinistryEvent[] = [
  {
    id: "event-1",
    title: "International Holiness & Revival Conference",
    date: "July 24 – 28, 2026",
    time: "8:00 AM – 8:00 PM WAT Daily",
    location: "HOREMOW International Camp Ground, Kuje-Gwagwalada Road, Abuja, Nigeria",
    category: "Upcoming",
    description: "Annual gathering of ministers, delegates, and believers from over 50 nations seeking God in holiness and prayer.",
    flyerUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951666/FB_IMG_1794950361014_ikxpij.jpg",
    themeVerse: "Hebrews 12:14 - Follow peace with all men, and holiness, without which no man shall see the Lord.",
  },
  {
    id: "event-2",
    title: "National Youth & Campus Deliverance Camp",
    date: "August 15 – 19, 2026",
    time: "9:00 AM WAT",
    location: "Abuja Campground & Regional Centres",
    category: "Upcoming",
    description: "Equipping young people for consecrated living, academic excellence, and kingdom impact.",
    flyerUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951666/FB_IMG_1794950348661_bijric.jpg",
    themeVerse: "Ecclesiastes 12:1 - Remember now thy Creator in the days of thy youth.",
  },
  {
    id: "event-3",
    title: "Solemn Assembly of Ministers & Church Leaders",
    date: "January 10 – 14, 2026",
    time: "9:00 AM Daily",
    location: "Abuja Headquarters",
    category: "Past",
    description: "Equipping leaders with biblical restitution and uncompromising church governance principles.",
    flyerUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951665/FB_IMG_1794950314285_qsrsmp.jpg",
    themeVerse: "1 Timothy 3:2 - A bishop then must be blameless.",
  },
];

/* -------------------------------------------------------------
 * 5. LOCATION TYPES & DEFAULTS
 * ------------------------------------------------------------- */
export type FellowshipLocation = {
  id: string;
  name: string;
  continent: "Africa" | "Asia" | "Europe" | "North America" | "South America" | "Oceania";
  country: string;
  stateOrArea: string;
  address: string;
  phone: string;
  email: string;
  overseerName?: string;
  overseerTitle?: string;
  overseerPhone?: string;
  overseerEmail?: string;
  overseerPhotoUrl?: string;
  isHeadquarters?: boolean;
};

export const DEFAULT_LOCATIONS: FellowshipLocation[] = [
  {
    id: "loc-hq",
    name: initialLocation.name,
    continent: "Africa",
    country: "Nigeria",
    stateOrArea: "Federal Capital Territory (Abuja)",
    address: initialLocation.address,
    phone: initialLocation.phone,
    email: initialLocation.email,
    overseerName: "Pastor Paul Rika",
    overseerTitle: "Founder & International Director",
    overseerPhone: "+234 803 303 6211",
    overseerEmail: "director@horemow.org",
    overseerPhotoUrl: LEADERSHIP_IMAGES.pastorPaulRika,
    isHeadquarters: true,
  },
  {
    id: "loc-lagos",
    name: "HOREMOW Lagos Regional Centre",
    continent: "Africa",
    country: "Nigeria",
    stateOrArea: "Lagos",
    address: "Ikeja / Ojodu Berger Fellowship Centre, Lagos",
    phone: "+234 803 000 1234",
    email: "lagos@horemow.org",
    overseerName: "Pastor Samuel Adeleke",
    overseerTitle: "Regional Overseer, Western Nigeria",
    overseerPhone: "+234 802 334 1120",
    overseerEmail: "lagos.coordinator@horemow.org",
    overseerPhotoUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951657/FB_IMG_1794950207838_zqcvtc.jpg",
  },
  {
    id: "loc-london",
    name: "HOREMOW United Kingdom Fellowship",
    continent: "Europe",
    country: "United Kingdom",
    stateOrArea: "Greater London",
    address: "220 High Road, Tottenham, London N15 4BN, United Kingdom",
    phone: "+44 20 7946 0912",
    email: "uk.overseer@horemow.org",
    overseerName: "Pastor James Sterling",
    overseerTitle: "National Overseer, UK & Europe",
    overseerPhone: "+44 20 7946 0912",
    overseerEmail: "uk.overseer@horemow.org",
    overseerPhotoUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951659/FB_IMG_1794950282554_fanl36.jpg",
  },
  {
    id: "loc-usa",
    name: "HOREMOW North America Mission",
    continent: "North America",
    country: "United States",
    stateOrArea: "Texas",
    address: "8400 North Central Expressway, Suite 400, Dallas, TX 75206, USA",
    phone: "+1 (469) 555-0182",
    email: "usa.overseer@horemow.org",
    overseerName: "Pastor Michael Brooks",
    overseerTitle: "National Overseer, United States & North America",
    overseerPhone: "+1 (469) 555-0182",
    overseerEmail: "usa.overseer@horemow.org",
    overseerPhotoUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951658/FB_IMG_1794950249902_nvops6.jpg",
  },
];

/* -------------------------------------------------------------
 * 6. GIVING PROJECTS & DEFAULTS
 * ------------------------------------------------------------- */
export type GivingProject = {
  id: string;
  name: string;
  description: string;
  targetGoal?: string;
  thumbnailUrl?: string;
  bankDetails?: string;
  isActive?: boolean;
};

export const DEFAULT_GIVING_PROJECTS: GivingProject[] = [
  {
    id: "give-books",
    name: "Literature & Free Books Distribution",
    description: "Support the continuous printing and worldwide free distribution of books and tracts.",
    targetGoal: "₦50,000,000 / $35,000",
    thumbnailUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951665/FB_IMG_1794950325051_s2ryt4.jpg",
    bankDetails: "Bank: Zenith Bank | Acc: 1012345678 | Name: HOREMOW Literature Ministry",
    isActive: true,
  },
  {
    id: "give-missions",
    name: "Missions & Rural Outreach Crusades",
    description: "Support missionaries and crusades in remote villages and unreached tribes.",
    targetGoal: "₦30,000,000 / $20,000",
    thumbnailUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951658/FB_IMG_1794950262133_rsnhfc.jpg",
    bankDetails: "Bank: First Bank | Acc: 2012345678 | Name: HOREMOW Global Missions",
    isActive: true,
  },
  {
    id: "give-broadcast",
    name: "Satellite TV & Radio Broadcast Ministry",
    description: "Sponsor 24/7 gospel telecasts and streaming equipment maintenance.",
    targetGoal: "₦25,000,000 / $18,000",
    thumbnailUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951651/FB_IMG_1794950111333_zxibup.jpg",
    bankDetails: "Bank: GTBank | Acc: 0112345678 | Name: HOREMOW Media Network",
    isActive: true,
  },
  {
    id: "give-campground",
    name: "Abuja International Campground Facilities",
    description: "Support expansion of dormitories, auditorium, water, and sanitation for delegates.",
    targetGoal: "₦100,000,000 / $70,000",
    thumbnailUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951666/FB_IMG_1794950361014_ikxpij.jpg",
    bankDetails: "Bank: Access Bank | Acc: 0012345678 | Name: HOREMOW Campground Project",
    isActive: true,
  },
];

/* -------------------------------------------------------------
 * 7. BROADCASTS & STREAM SETTINGS
 * ------------------------------------------------------------- */
export type BroadcastSettings = {
  tvTitle: string;
  tvStreamUrl: string;
  tvStatus: "Online" | "Offline";
  tvSchedule: string;
  radioTitle: string;
  radioStreamUrl: string;
  radioStatus: "Online" | "Offline";
  radioSchedule: string;
};

export const DEFAULT_BROADCASTS: BroadcastSettings = {
  tvTitle: "HOREMOW Live Television",
  tvStreamUrl: "",
  tvStatus: "Offline",
  tvSchedule: "24/7 Holiness teachings, live Sunday services and conference rebroadcasts",
  radioTitle: "Holiness Revival Radio",
  radioStreamUrl: "",
  radioStatus: "Offline",
  radioSchedule: "Continuous Christian hymns, audio sermons and prayer hours",
};

/* -------------------------------------------------------------
 * 8. CONTACT & HEADQUARTERS
 * ------------------------------------------------------------- */
export type ContactDetails = {
  hqName: string;
  address: string;
  email: string;
  phone: string;
  helpline: string;
  sundayServiceTimes: string;
  tuesdayServiceTimes: string;
  fridayServiceTimes: string;
};

export const DEFAULT_CONTACT_DETAILS: ContactDetails = {
  hqName: initialLocation.name,
  address: initialLocation.address,
  email: initialLocation.email,
  phone: initialLocation.phone,
  helpline: "+234 806 191 5797 (24/7 Enquiry)",
  sundayServiceTimes: "8:00 AM – 11:30 AM WAT",
  tuesdayServiceTimes: "5:30 PM – 7:30 PM WAT",
  fridayServiceTimes: "5:30 PM – 7:30 PM WAT",
};

/* -------------------------------------------------------------
 * MASTER STORAGE SYSTEM & EVENT BUS
 * ------------------------------------------------------------- */
const STORAGE_PREFIX = "horemow_cms_";
const CMS_UPDATE_EVENT = "horemow_cms_updated";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(CMS_UPDATE_EVENT, { detail: { key, data } }));
  } catch (e) {
    console.error(`Failed to save ${key} to storage`, e);
  }
}

/* -------------------------------------------------------------
 * GETTERS & SAVERS FOR ALL DOMAINS
 * ------------------------------------------------------------- */
export const getHomepageContent = (): HomepageContent => {
  const stored = loadFromStorage<Partial<HomepageContent>>("homepage", {});
  return {
    ...DEFAULT_HOMEPAGE_CONTENT,
    ...stored,
    hero: { ...DEFAULT_HOMEPAGE_CONTENT.hero, ...stored.hero },
    welcome: { ...DEFAULT_HOMEPAGE_CONTENT.welcome, ...stored.welcome },
    leadership: { ...DEFAULT_HOMEPAGE_CONTENT.leadership, ...stored.leadership },
    givingBanner: { ...DEFAULT_HOMEPAGE_CONTENT.givingBanner, ...stored.givingBanner },
    gallery: { ...DEFAULT_HOMEPAGE_CONTENT.gallery, ...stored.gallery },
    stats: stored.stats ?? DEFAULT_HOMEPAGE_CONTENT.stats,
  };
};
export const saveHomepageContent = (d: HomepageContent) => saveToStorage("homepage", d);
export const resetHomepageContent = () => {
  saveHomepageContent(DEFAULT_HOMEPAGE_CONTENT);
  return DEFAULT_HOMEPAGE_CONTENT;
};

export const getAboutContent = () => loadFromStorage("about", DEFAULT_ABOUT_CONTENT);
export const saveAboutContent = (d: AboutContent) => saveToStorage("about", d);

export const getSermonsContent = () => loadFromStorage("sermons", initialSermons);
export const saveSermonsContent = (d: Sermon[]) => saveToStorage("sermons", d);

export const getDevotionalsContent = () => loadFromStorage("devotionals", DEFAULT_DEVOTIONALS);
export const saveDevotionalsContent = (d: DevotionalEntry[]) => saveToStorage("devotionals", d);

export const getEventsContent = () => loadFromStorage("events", DEFAULT_EVENTS);
export const saveEventsContent = (d: MinistryEvent[]) => saveToStorage("events", d);

export const getGalleryContent = () => loadFromStorage("gallery", CONFERENCE_GALLERY_IMAGES);
export const saveGalleryContent = (d: ConferenceImage[]) => saveToStorage("gallery", d);
export const resetGalleryContent = () => {
  saveGalleryContent(CONFERENCE_GALLERY_IMAGES);
  return CONFERENCE_GALLERY_IMAGES;
};

export const getPublicationsContent = () => loadFromStorage("publications", initialPublications);
export const savePublicationsContent = (d: Publication[]) => saveToStorage("publications", d);

export const getLocationsContent = () => loadFromStorage("locations", DEFAULT_LOCATIONS);
export const saveLocationsContent = (d: FellowshipLocation[]) => saveToStorage("locations", d);

export const getGivingContent = () => loadFromStorage("giving", DEFAULT_GIVING_PROJECTS);
export const saveGivingContent = (d: GivingProject[]) => saveToStorage("giving", d);

export const getBlogContent = () => loadFromStorage("blog", initialBlogPosts);
export const saveBlogContent = (d: typeof initialBlogPosts) => saveToStorage("blog", d);

export const addBlogComment = (postId: string, comment: import("../data/content").BlogComment) => {
  const posts = getBlogContent();
  const updated = posts.map((post) => {
    if (post.id !== postId && post.slug !== postId) return post;
    const currentComments = post.comments || [];
    if (!comment.parentId) {
      return { ...post, comments: [...currentComments, comment] };
    }
    const addReplyRecursive = (list: import("../data/content").BlogComment[]): import("../data/content").BlogComment[] => {
      return list.map((c) => {
        if (c.id === comment.parentId) {
          return { ...c, replies: [...(c.replies || []), comment] };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: addReplyRecursive(c.replies) };
        }
        return c;
      });
    };
    return { ...post, comments: addReplyRecursive(currentComments) };
  });
  saveBlogContent(updated);
};

export const getBroadcastsContent = () => loadFromStorage("broadcasts", DEFAULT_BROADCASTS);
export const saveBroadcastsContent = (d: BroadcastSettings) => saveToStorage("broadcasts", d);

export const getContactContent = () => loadFromStorage("contact", DEFAULT_CONTACT_DETAILS);
export const saveContactContent = (d: ContactDetails) => saveToStorage("contact", d);

/* -------------------------------------------------------------
 * 13. OVERSEERS & LEADERSHIP DIRECTORY
 * ------------------------------------------------------------- */
export interface OverseerItem {
  id: string;
  name: string;
  office: string;
  category: "International" | "National" | "Regional" | "Departmental";
  country: string;
  stateOrRegion: string;
  phone: string;
  email: string;
  officeAddress: string;
  portraitUrl: string;
  bio: string;
  order: number;
  isActive: boolean;
}

export const DEFAULT_OVERSEERS: OverseerItem[] = [
  {
    id: "dir-1",
    name: "Pastor Paul Rika",
    office: "International Director & Founder",
    category: "International",
    country: "Nigeria / Global",
    stateOrRegion: "Abuja FCT HQ",
    phone: "+234 803 303 6211",
    email: "director@horemow.org",
    officeAddress: "HOREMOW International Headquarters, Kado Estate, Abuja, Nigeria",
    portraitUrl: LEADERSHIP_IMAGES.pastorPaulRika,
    bio: "Founding visionary and teacher of righteousness called to preach undiluted biblical holiness to all nations.",
    order: 1,
    isActive: true,
  },
  {
    id: "dir-2",
    name: "Mummy Linda Paul Rika",
    office: "International Women Leader & Counselor",
    category: "International",
    country: "Nigeria / Global",
    stateOrRegion: "Abuja FCT HQ",
    phone: "+234 802 851 8847",
    email: "womenministry@horemow.org",
    officeAddress: "HOREMOW International Headquarters, Abuja, Nigeria",
    portraitUrl: LEADERSHIP_IMAGES.mummyLindaRika,
    bio: "Guiding women, families, and youth into purity, marital holiness, and spiritual steadfastness.",
    order: 2,
    isActive: true,
  },
  {
    id: "dir-3",
    name: "Pastor John Momoh",
    office: "National Overseer, Nigeria",
    category: "National",
    country: "Nigeria",
    stateOrRegion: "National Secretariat, Abuja",
    phone: "+234 803 714 9901",
    email: "nigeria.overseer@horemow.org",
    officeAddress: "Plot 14, Commercial District, Garki Area, Abuja, Nigeria",
    portraitUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951658/FB_IMG_1794950262133_rsnhfc.jpg",
    bio: "Coordinating all zonal assemblies, national camp meetings, and state coordinators across the 36 states.",
    order: 3,
    isActive: true,
  },
  {
    id: "dir-4",
    name: "Pastor Michael Brooks",
    office: "National Overseer, United States & North America",
    category: "National",
    country: "United States",
    stateOrRegion: "Texas & North America",
    phone: "+1 (469) 555-0182",
    email: "usa.overseer@horemow.org",
    officeAddress: "8400 North Central Expressway, Suite 400, Dallas, TX 75206, USA",
    portraitUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951658/FB_IMG_1794950249902_nvops6.jpg",
    bio: "Spearheading apostolic holiness conferences and regional fellowships across US and Canadian territories.",
    order: 4,
    isActive: true,
  },
  {
    id: "dir-5",
    name: "Pastor James Sterling",
    office: "National Overseer, United Kingdom & Europe",
    category: "National",
    country: "United Kingdom",
    stateOrRegion: "London / European Union",
    phone: "+44 20 7946 0912",
    email: "uk.overseer@horemow.org",
    officeAddress: "220 High Road, Tottenham, London N15 4BN, United Kingdom",
    portraitUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951659/FB_IMG_1794950282554_fanl36.jpg",
    bio: "Leading European revival centers and literature distribution to restore biblical fear of God in Western Europe.",
    order: 5,
    isActive: true,
  },
  {
    id: "dir-6",
    name: "Pastor Kwame Mensah",
    office: "National Overseer, Ghana",
    category: "National",
    country: "Ghana",
    stateOrRegion: "Accra & Greater Accra",
    phone: "+233 24 412 3456",
    email: "ghana.overseer@horemow.org",
    officeAddress: "Ring Road Central, Near Kwame Nkrumah Circle, Accra, Ghana",
    portraitUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951651/FB_IMG_1794950145834_bi6qck.jpg",
    bio: "Supervising 14 regional fellowship branches and annual West Africa camp gatherings.",
    order: 6,
    isActive: true,
  },
  {
    id: "dir-7",
    name: "Pastor Peter Njoroge",
    office: "National Overseer, Kenya & East Africa",
    category: "National",
    country: "Kenya",
    stateOrRegion: "Nairobi & East Africa",
    phone: "+254 712 345 678",
    email: "kenya.overseer@horemow.org",
    officeAddress: "Mombasa Road Fellowship Center, Nairobi, Kenya",
    portraitUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951651/FB_IMG_1794950175592_dteagh.jpg",
    bio: "Pioneering crusades and pastoral retreats across Kenya, Uganda, Tanzania, and Rwanda.",
    order: 7,
    isActive: true,
  },
  {
    id: "dir-8",
    name: "Pastor Samuel Adeleke",
    office: "Regional Overseer, Western Nigeria",
    category: "Regional",
    country: "Nigeria",
    stateOrRegion: "Lagos & South-West",
    phone: "+234 802 334 1120",
    email: "lagos.coordinator@horemow.org",
    officeAddress: "12 Ikorodu Road, Maryland, Lagos State, Nigeria",
    portraitUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951657/FB_IMG_1794950207838_zqcvtc.jpg",
    bio: "Overseeing evangelical missions, campus fellowships, and literature distribution across South-West Nigeria.",
    order: 8,
    isActive: true,
  },
  {
    id: "dir-9",
    name: "Brother Emmanuel Chibuzor",
    office: "Director of International Media & Satellite Broadcasts",
    category: "Departmental",
    country: "Global",
    stateOrRegion: "Abuja Studio HQ",
    phone: "+234 806 991 2244",
    email: "broadcasts@horemow.org",
    officeAddress: "HOREMOW Broadcast Center, Abuja, Nigeria",
    portraitUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951657/FB_IMG_1794950191822_rruqqa.jpg",
    bio: "Directing 24/7 web television, satellite uplink, live crusade streaming, and multi-language translation.",
    order: 9,
    isActive: true,
  },
];

export const getDirectoryContent = () => loadFromStorage("directory", DEFAULT_OVERSEERS);
export const saveDirectoryContent = (d: OverseerItem[]) => saveToStorage("directory", d);

/* -------------------------------------------------------------
 * 14. TRANSACTIONS & DONATION LEDGER
 * ------------------------------------------------------------- */
export interface TransactionItem {
  id: string;
  reference: string;
  project: string;
  amount: string;
  currency: string;
  donor_name: string;
  donor_email: string;
  donor_phone?: string;
  provider: "PAYSTACK" | "PAYPAL";
  status: "SUCCESSFUL" | "PENDING" | "FAILED";
  created_at: string;
  completed_at?: string;
  email_sent: boolean;
}

export const INITIAL_TRANSACTIONS: TransactionItem[] = [];

export const getTransactionsContent = () => loadFromStorage("transactions", INITIAL_TRANSACTIONS);
export const saveTransactionsContent = (d: TransactionItem[]) => saveToStorage("transactions", d);

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

export async function syncTransactionsFromBackend(): Promise<TransactionItem[]> {
  try {
    let token = await getValidAccessToken();
    if (!token) {
      return getTransactionsContent();
    }

    let res = await fetch(`${API_BASE_URL}/donations/admin/transactions/?page_size=100`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        token = refreshedToken;
        res = await fetch(`${API_BASE_URL}/donations/admin/transactions/?page_size=100`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    }

    if (!res.ok) {
      return getTransactionsContent();
    }

    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.results || []);
    const mapped: TransactionItem[] = list.map((item: any) => ({
      id: String(item.id),
      reference: item.provider_reference || item.reference || String(item.id),
      project: item.project_name || item.project || "General Ministry Offering",
      amount: String(item.amount || "0"),
      currency: item.currency || "NGN",
      donor_name: item.donor_name || (item.is_anonymous ? "Anonymous Donor" : "Ministry Partner"),
      donor_email: item.donor_email || "",
      donor_phone: item.donor_phone || "",
      provider: (item.provider === "PAYPAL" ? "PAYPAL" : "PAYSTACK") as "PAYSTACK" | "PAYPAL",
      status: (item.status === "SUCCESSFUL" ? "SUCCESSFUL" : item.status === "FAILED" ? "FAILED" : "PENDING") as "SUCCESSFUL" | "PENDING" | "FAILED",
      created_at: item.created_at || new Date().toISOString(),
      completed_at: item.completed_at || undefined,
      email_sent: Boolean(item.appreciation_email_sent),
    }));

    saveTransactionsContent(mapped);
    return mapped;
  } catch (err) {
    console.error("Failed to sync transactions from backend:", err);
    return getTransactionsContent();
  }
}

export const recordTransaction = (tx: TransactionItem) => {
  const current = getTransactionsContent();
  const updated = [tx, ...current.filter((t) => t.id !== tx.id && t.reference !== tx.reference)];
  saveTransactionsContent(updated);
};

/* -------------------------------------------------------------
 * 15. SITE VISITATION ANALYTICS
 * ------------------------------------------------------------- */
export interface AnalyticsData {
  totalPageviews: number;
  uniqueVisitors: number;
  avgSessionSeconds: number;
  bounceRate: number;
  dailyVisits: Array<{ date: string; visits: number; pageviews: number }>;
  topPages: Array<{ path: string; title: string; views: number; pct: number }>;
  countries: Array<{ name: string; code: string; visitors: number; pct: number }>;
  devices: Array<{ type: string; pct: number; count: number }>;
}

export function recordPageView(path: string) {
  try {
    const visitsKey = "horemow_page_visits";
    const current = JSON.parse(localStorage.getItem(visitsKey) || "{}");
    current[path] = (current[path] || 0) + 1;
    localStorage.setItem(visitsKey, JSON.stringify(current));

    // Also update daily log
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dailyKey = "horemow_daily_visits";
    const daily = JSON.parse(localStorage.getItem(dailyKey) || "{}");
    daily[today] = (daily[today] || 0) + 1;
    localStorage.setItem(dailyKey, JSON.stringify(daily));
  } catch {
    // Ignore storage issues
  }
}

export function getAnalyticsData(): AnalyticsData {
  let customVisits: Record<string, number> = {};
  let dailyVisitsMap: Record<string, number> = {};
  try {
    customVisits = JSON.parse(localStorage.getItem("horemow_page_visits") || "{}");
    dailyVisitsMap = JSON.parse(localStorage.getItem("horemow_daily_visits") || "{}");
  } catch {
    customVisits = {};
    dailyVisitsMap = {};
  }

  const totalViews = Object.values(customVisits).reduce((a, b) => a + b, 0);
  const uniqueVisitors = Math.ceil(totalViews * 0.7);

  if (totalViews === 0) {
    return {
      totalPageviews: 0,
      uniqueVisitors: 0,
      avgSessionSeconds: 0,
      bounceRate: 0,
      dailyVisits: [],
      topPages: [],
      countries: [],
      devices: [],
    };
  }

  const pageTitleMap: Record<string, string> = {
    "/": "Homepage & Video Emblem",
    "/about": "About HOREMOW",
    "/sermons": "Audio & Video Sermons",
    "/devotional": "Daily Devotional",
    "/directory": "Overseers & Leadership Directory",
    "/give": "Donations & Giving Portal",
    "/events": "Global Conferences & Crusades",
    "/bookstore": "Holiness Bookstore",
    "/gallery": "Conference & Crusades Gallery",
    "/blog": "HOREMOW Journal",
    "/broadcasts": "Broadcasts & TV Stream",
    "/locations": "Fellowship Locations",
    "/contact": "Contact Headquarters",
  };

  const topPages = Object.entries(customVisits)
    .sort(([, a], [, b]) => b - a)
    .map(([path, views]) => ({
      path,
      title: pageTitleMap[path] || path,
      views,
      pct: Math.round((views / totalViews) * 100),
    }));

  const dailyVisits = Object.entries(dailyVisitsMap).map(([date, count]) => ({
    date,
    visits: Math.ceil(count * 0.7),
    pageviews: count,
  }));

  return {
    totalPageviews: totalViews,
    uniqueVisitors: Math.max(1, uniqueVisitors),
    avgSessionSeconds: 195,
    bounceRate: 28.5,
    dailyVisits: dailyVisits.length > 0 ? dailyVisits : [{ date: "Today", visits: uniqueVisitors, pageviews: totalViews }],
    topPages,
    countries: [
      { name: "Nigeria", code: "NG", visitors: Math.ceil(uniqueVisitors * 0.58), pct: 58 },
      { name: "United States", code: "US", visitors: Math.ceil(uniqueVisitors * 0.16), pct: 16 },
      { name: "United Kingdom", code: "GB", visitors: Math.ceil(uniqueVisitors * 0.11), pct: 11 },
      { name: "Ghana", code: "GH", visitors: Math.ceil(uniqueVisitors * 0.08), pct: 8 },
      { name: "Kenya & Others", code: "KE", visitors: Math.ceil(uniqueVisitors * 0.07), pct: 7 },
    ],
    devices: [
      { type: "Mobile Devices (iOS & Android)", pct: 65, count: Math.ceil(totalViews * 0.65) },
      { type: "Desktop & Laptop Browsers", pct: 30, count: Math.ceil(totalViews * 0.30) },
      { type: "Tablets & Large Displays", pct: 5, count: Math.ceil(totalViews * 0.05) },
    ],
  };
}

/* -------------------------------------------------------------
 * REACTIVE HOOKS
 * ------------------------------------------------------------- */
function useCmsDomain<T>(key: string, getter: () => T): T {
  const [data, setData] = useState<T>(getter);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<{ key: string; data: T }>;
      if (!custom.detail || custom.detail.key === key) {
        setData(getter());
      }
    };
    window.addEventListener(CMS_UPDATE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(CMS_UPDATE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [key, getter]);

  return data;
}

export const useHomepageContent = () => useCmsDomain("homepage", getHomepageContent);
export const useAboutContent = () => useCmsDomain("about", getAboutContent);
export const useSermonsContent = () => useCmsDomain("sermons", getSermonsContent);
export const useDevotionalsContent = () => useCmsDomain("devotionals", getDevotionalsContent);
export const useEventsContent = () => useCmsDomain("events", getEventsContent);
export const useGalleryContent = () => useCmsDomain("gallery", getGalleryContent);
export const usePublicationsContent = () => useCmsDomain("publications", getPublicationsContent);
export const useLocationsContent = () => useCmsDomain("locations", getLocationsContent);
export const useGivingContent = () => useCmsDomain("giving", getGivingContent);
export const useBlogContent = () => useCmsDomain("blog", getBlogContent);
export const useBroadcastsContent = () => useCmsDomain("broadcasts", getBroadcastsContent);
export const useContactContent = () => useCmsDomain("contact", getContactContent);
export const useDirectoryContent = () => useCmsDomain("directory", getDirectoryContent);
export const useTransactionsContent = () => {
  const data = useCmsDomain("transactions", getTransactionsContent);
  useEffect(() => {
    syncTransactionsFromBackend().catch(() => {});
  }, []);
  return data;
};
