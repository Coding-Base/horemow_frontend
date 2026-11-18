/**
 * Official HOREMOW Media Assets
 * All URLs are hosted on Cloudinary and verified.
 */

export const LEADERSHIP_IMAGES = {
  pastorPaulRika: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794987729/pastor_paul_rika_ynemhk.jpg",
  mummyLindaRika: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951642/FB_IMG_1794949925011_nhzo0g.jpg",
} as const;

export type ConferenceImage = {
  id: string;
  url: string;
  title: string;
  category: "Conferences" | "Crusades" | "Worship" | "Ministers";
  description: string;
};

export const CONFERENCE_GALLERY_IMAGES: ConferenceImage[] = [
  {
    id: "conf-1",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951666/FB_IMG_1794950361014_ikxpij.jpg",
    title: "International Holiness Conference",
    category: "Conferences",
    description: "Believers gathered in unity seeking the outpouring of the Holy Spirit and deeper walk in truth.",
  },
  {
    id: "conf-2",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951666/FB_IMG_1794950348661_bijric.jpg",
    title: "Global Ministers & Leaders Summit",
    category: "Ministers",
    description: "Equipping pastors and leaders with uncompromising biblical truth and holy living principles.",
  },
  {
    id: "conf-3",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951665/FB_IMG_1794950314285_qsrsmp.jpg",
    title: "National Camp Meeting & Deliverance Session",
    category: "Conferences",
    description: "Intense prayer and deliverance as thousands experience freedom through Jesus Christ.",
  },
  {
    id: "conf-4",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951665/FB_IMG_1794950325051_s2ryt4.jpg",
    title: "Worldwide Holy Ghost Gathering",
    category: "Worship",
    description: "Deep, reverent worship and intercession for revival in the nations.",
  },
  {
    id: "conf-5",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951659/FB_IMG_1794950282554_fanl36.jpg",
    title: "Evangelistic Crusade & Soul Harvest",
    category: "Crusades",
    description: "Reaching the unreached with the eternal gospel of salvation and righteousness.",
  },
  {
    id: "conf-6",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951662/FB_IMG_1794950304978_gq7q3q.jpg",
    title: "Youth & Campus Holiness Summit",
    category: "Conferences",
    description: "Empowering young people to stand firm for Christ with purity and moral integrity.",
  },
  {
    id: "conf-7",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951658/FB_IMG_1794950262133_rsnhfc.jpg",
    title: "Solemn Assembly of Intercessors",
    category: "Worship",
    description: "Praying for nations, spiritual awakening, and the global church.",
  },
  {
    id: "conf-8",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951658/FB_IMG_1794950249902_nvops6.jpg",
    title: "Abuja Headquarters Grand Convocation",
    category: "Conferences",
    description: "Delegates from across continents assembling at the international camp ground in Abuja.",
  },
  {
    id: "conf-9",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951651/FB_IMG_1794950111333_zxibup.jpg",
    title: "Open-Air Miracle Crusade",
    category: "Crusades",
    description: "Signs and wonders confirming the proclaimed Word in rural and urban mission fields.",
  },
  {
    id: "conf-10",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951651/FB_IMG_1794950145834_bi6qck.jpg",
    title: "Pastoral Training & Exhortation",
    category: "Ministers",
    description: "Sound biblical doctrine taught by senior evangelists and ministers of HOREMOW.",
  },
  {
    id: "conf-11",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951651/FB_IMG_1794950175592_dteagh.jpg",
    title: "Women of Purity & Prayer Gathering",
    category: "Conferences",
    description: "Mothers, daughters and sisters gathering for spiritual nourishment and family restoration.",
  },
  {
    id: "conf-12",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951657/FB_IMG_1794950207838_zqcvtc.jpg",
    title: "Regional Revival Outpouring",
    category: "Crusades",
    description: "Igniting fires of repentance, restitution, and revival across state boundaries.",
  },
  {
    id: "conf-13",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951657/FB_IMG_1794950191822_rruqqa.jpg",
    title: "Choral & Congregational Praise",
    category: "Worship",
    description: "Lifting heavenly songs and hymns honoring the holiness of God.",
  },
  {
    id: "conf-14",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951658/FB_IMG_1794950218900_xf9gtq.jpg",
    title: "Night of Divine Encounters",
    category: "Worship",
    description: "Vigils dedicated to prevailing prayer, repentance and personal transformation.",
  },
  {
    id: "conf-15",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951641/FB_IMG_1794949900696_rezavx.jpg",
    title: "Discipleship & Bible Study Class",
    category: "Ministers",
    description: "Systematic line-by-line exposition of Scripture for spiritual growth and readiness.",
  },
  {
    id: "conf-16",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951642/FB_IMG_1794949960538_xqrqut.jpg",
    title: "Mass Repentance & Restitution",
    category: "Crusades",
    description: "Men and women coming to the altar, surrendering all to Jesus Christ.",
  },
  {
    id: "conf-17",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951643/FB_IMG_1794949968978_a4v2mu.jpg",
    title: "Ministers' Ordination & Charge",
    category: "Ministers",
    description: "Commissioning faithful workers into the harvest field with the message of holiness.",
  },
  {
    id: "conf-18",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951643/FB_IMG_1794950008181_t419gm.jpg",
    title: "Global Mission Mobilization",
    category: "Crusades",
    description: "Sending literature, Bibles and missionaries to remote tribes and nations.",
  },
  {
    id: "conf-19",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951649/FB_IMG_1794950025321_njfmdb.jpg",
    title: "International Delegates Session",
    category: "Conferences",
    description: "Representatives from over 50 nations sharing reports of gospel advancement.",
  },
  {
    id: "conf-20",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951629/FB_IMG_1794949828508_uev5wc.jpg",
    title: "Children & Teen Bible Festival",
    category: "Conferences",
    description: "Nurturing the younger generation in the fear of God and moral purity.",
  },
  {
    id: "conf-21",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951630/FB_IMG_1794949836557_v7vzxv.jpg",
    title: "Campground Fellowship & Assembly",
    category: "Worship",
    description: "Fellowship of the saints in love, sharing the word and breaking bread.",
  },
  {
    id: "conf-22",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951629/FB_IMG_1794949808572_igtb97.jpg",
    title: "Faithful Believers in Worship",
    category: "Worship",
    description: "Lifting holy hands without wrath or doubting, magnifying the King of kings.",
  },
  {
    id: "conf-23",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951630/FB_IMG_1794949861130_giyt04.jpg",
    title: "Gospel Literature Distribution Drive",
    category: "Crusades",
    description: "Free distribution of holiness books and tracts to hungry souls.",
  },
  {
    id: "conf-24",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951630/FB_IMG_1794949846728_bnhlvy.jpg",
    title: "Spiritual Breakthrough & Restoration",
    category: "Worship",
    description: "Hearts broken and mended under the power of the living Word.",
  },
  {
    id: "conf-25",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951632/FB_IMG_1794949893322_hir3ja.jpg",
    title: "The Word of Truth Proclaimed",
    category: "Ministers",
    description: "Fearless proclamation of repentance, restitution, and heaven readiness.",
  },
  {
    id: "conf-26",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951628/FB_IMG_1794949814764_bocoug.jpg",
    title: "Sanctuary Dedication & Thanksgiving",
    category: "Worship",
    description: "Rejoicing in God's faithfulness and provision for the movement.",
  },
  {
    id: "conf-27",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951628/FB_IMG_1794949771230_zofbfo.jpg",
    title: "Global Evangelism Commission",
    category: "Crusades",
    description: "Taking the message of the cross and holiness to the ends of the earth.",
  },
  {
    id: "conf-28",
    url: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951629/FB_IMG_1794949781799_zqnusu.jpg",
    title: "Concluding Benediction & Praise",
    category: "Conferences",
    description: "Parting blessings as delegates return to their mission stations revitalized.",
  },
];
