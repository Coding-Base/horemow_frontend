export type SermonCategory =
  | "Holiness"
  | "Restitution"
  | "Marriage"
  | "Faith"
  | "Heaven & Hell"
  | "Evangelism"
  | "Church & Leadership"
  | "Exhortation";

export type Sermon = {
  id: string;
  title: string;
  speaker: string;
  category: SermonCategory;
  duration: string;
  summary: string;
  videoUrl?: string | null;
  audioUrl?: string | null;
  telegramUrl?: string | null;
  thumbnailUrl?: string | null;
  datePreached?: string;
  description?: string;
};

export const sermonCategories: SermonCategory[] = [
  "Holiness",
  "Restitution",
  "Marriage",
  "Faith",
  "Heaven & Hell",
  "Evangelism",
  "Church & Leadership",
  "Exhortation",
];

export const sermons: Sermon[] = [
  {
    id: "christian-leaders",
    title: "The State of Christian Leaders",
    speaker: "Pastor Paul Rika",
    category: "Holiness",
    duration: "2 hr 02 min",
    summary:
      "A deep prophetic reflection on spiritual leadership, faithfulness, and the urgent call to remain grounded in biblical righteousness.",
    thumbnailUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794987729/pastor_paul_rika_ynemhk.jpg",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    audioUrl: "https://res.cloudinary.com/dae0htmcz/video/upload/v1794951666/sample_audio.mp3",
    telegramUrl: "https://t.me/horemowchannel/102",
    datePreached: "2026-10-14",
    description: "Full message transcript and audio recording from the International Ministers & Leaders Summit.",
  },
  {
    id: "church-leadership",
    title: "Principles of Leadership in the Church",
    speaker: "Pastor Paul Rika",
    category: "Church & Leadership",
    duration: "1 hr 22 min",
    summary:
      "A teaching on self-denial, divine responsibility, and the sacred character expected of overseers and leaders in the House of God.",
    thumbnailUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951666/FB_IMG_1794950348661_bijric.jpg",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    audioUrl: "https://res.cloudinary.com/dae0htmcz/video/upload/v1794951666/sample_audio.mp3",
    telegramUrl: "https://t.me/horemowchannel/104",
    datePreached: "2026-09-28",
    description: "Anointed guidelines for pastors, coordinators, and departmental directors.",
  },
  {
    id: "heaven-and-hell",
    title: "There Is Heaven and There Is Hell",
    speaker: "Evangelist Linda Paul Rika",
    category: "Heaven & Hell",
    duration: "2 hr 36 min",
    summary:
      "An earnest, soul-searching revelation concerning eternity, divine judgment, and living in watchful purity before Christ returns.",
    thumbnailUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951642/FB_IMG_1794949925011_nhzo0g.jpg",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    audioUrl: "https://res.cloudinary.com/dae0htmcz/video/upload/v1794951666/sample_audio.mp3",
    telegramUrl: "https://t.me/horemowchannel/108",
    datePreached: "2026-08-15",
    description: "A message delivered to over 25,000 believers at the National Camp Meeting.",
  },
  {
    id: "restitution-and-truth",
    title: "Walking in Truth and Biblical Restitution",
    speaker: "Pastor Paul Rika",
    category: "Restitution",
    duration: "1 hr 45 min",
    summary:
      "Clearing our past through honest confession and restitution according to the laws of righteousness and true conversion.",
    thumbnailUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951665/FB_IMG_1794950314285_qsrsmp.jpg",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    audioUrl: "https://res.cloudinary.com/dae0htmcz/video/upload/v1794951666/sample_audio.mp3",
    telegramUrl: "https://t.me/horemowchannel/112",
    datePreached: "2026-07-20",
    description: "Practical scriptural instruction on restoring what was taken wrongfully.",
  },
];

export type Publication = {
  id: string;
  title: string;
  author: string;
  category: string;
  language: string;
  description: string;
  coverUrl?: string;
  fileUrl?: string;
  telegramUrl?: string;
  format?: string;
  price?: string;
};

export const publications: Publication[] = [
  {
    id: "pub-1",
    title: "A Divine Call for Holy Women",
    author: "Pastor Paul Rika",
    category: "Holiness & Christian Living",
    language: "English, French, Hausa",
    description:
      "A profound biblical guide for Christian women, mothers, and daughters seeking genuine sanctification, inner modesty, and spiritual power.",
    coverUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951665/FB_IMG_1794950325051_s2ryt4.jpg",
    fileUrl: "https://horemow.org/books/divine-call-holy-women.pdf",
    telegramUrl: "https://t.me/horemowbooks/45",
    format: "PDF & Paperback (240 Pages)",
    price: "Free Download / Ministry Gift",
  },
  {
    id: "pub-2",
    title: "A Generation in Quest for Miracles",
    author: "Pastor Paul Rika",
    category: "Prayer & Faith",
    language: "English, Yoruba, Igbo",
    description:
      "Exposing modern deceptive signs and false wonders while directing seekers back to true repentance, the Cross of Christ, and holiness without compromise.",
    coverUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951658/FB_IMG_1794950262133_rsnhfc.jpg",
    fileUrl: "https://horemow.org/books/quest-for-miracles.pdf",
    telegramUrl: "https://t.me/horemowbooks/48",
    format: "PDF & Paperback (185 Pages)",
    price: "Free Download",
  },
  {
    id: "pub-3",
    title: "Be Careful with Your Marriage Because of Heaven",
    author: "Pastor Paul Rika",
    category: "Marriage & Family",
    language: "English, French",
    description:
      "Crucial end-time counsel addressing marital purity, godly communication, resolving differences in righteousness, and preserving one's heavenly reward.",
    coverUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951658/FB_IMG_1794950249902_nvops6.jpg",
    fileUrl: "https://horemow.org/books/marriage-because-of-heaven.pdf",
    telegramUrl: "https://t.me/horemowbooks/52",
    format: "PDF (310 Pages)",
    price: "Ministry Free Distribution",
  },
  {
    id: "pub-4",
    title: "Christian Love in Truth and Holiness",
    author: "Pastor Paul Rika",
    category: "End-Time & Heaven",
    language: "English, Hausa, French",
    description:
      "Unpacking the agape love of God which is pure, holy, free of carnality, and capable of enduring trials until the coming of the Lord.",
    coverUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951659/FB_IMG_1794950282554_fanl36.jpg",
    fileUrl: "https://horemow.org/books/christian-love-truth.pdf",
    telegramUrl: "https://t.me/horemowbooks/55",
    format: "PDF & Audiobook",
    price: "Free",
  },
];

export const doctrineTopics = [
  {
    title: "Holiness & Sanctification",
    description:
      "A life consecrated to God and shaped by biblical teaching and spiritual growth.",
  },
  {
    title: "Biblical Restitution",
    description:
      "Integrity includes a willingness to make amends where it is appropriate and possible.",
  },
  {
    title: "Christian Dressing & Modesty",
    description:
      "The movement teaches modesty as part of a believer's public and private conduct.",
  },
  {
    title: "Holy Marriage & Family",
    description:
      "Teaching and resources address marriage, family life and Christian responsibility.",
  },
];

export interface BlogComment {
  id: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  replies?: BlogComment[];
}

export interface BlogPost {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  body: string;
  date: string;
  author: string;
  readTime: string;
  thumbnailUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  status: "Published" | "Draft";
  comments: BlogComment[];
}

export const blogPosts: BlogPost[] = [
  {
    id: "post-1",
    slug: "daily-walk-shaped-by-the-word",
    category: "Faith & practice",
    title: "A daily walk shaped by the Word",
    excerpt:
      "Explore practical ways to keep scripture, prayer and integrity at the centre of everyday life.",
    body: `True spiritual vitality begins each morning when a believer submits their mind, heart, and thoughts to the living Word of God.

In Psalm 119:105, David writes: "Thy word is a lamp unto my feet, and a light unto my path." Without the conscious guidance of the Holy Scriptures, human wisdom falters and worldly influences easily compromise our standards of righteousness.

Practical Steps for Your Daily Walk:
1. Consecrate the First Hour: Let your earliest thoughts be lifted in gratitude and worship before screens and worldly affairs claim your attention.
2. Read with Intent: Do not merely glance through chapters to fulfill a ritual. Meditate on each verse, asking the Holy Spirit: "Lord, what art Thou saying to my conduct today?"
3. Guard Your Thoughts & Eyes: Flee all appearances of evil, gossip, and lustful entertainments.
4. Walk in Immediate Obedience: When scripture convicts you of an attitude or unholy word, repent immediately and make restitution where necessary.`,
    date: "18 Nov 2026",
    author: "Pastor Paul Rika",
    readTime: "5 min read",
    thumbnailUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951666/FB_IMG_1794950361014_ikxpij.jpg",
    metaTitle: "A Daily Walk Shaped by the Word | HOREMOW Journal",
    metaDescription: "Practical biblical guidance for maintaining sanctification and daily prayer in modern life.",
    metaKeywords: "holiness, daily walk, bible study, sanctification, pastor paul rika",
    status: "Published",
    comments: [
      {
        id: "comm-1",
        authorName: "Brother Andrew Joshua",
        authorEmail: "andrew.j@example.com",
        content: "This reflection is so timely. Consecrating the first hour has transformed my spiritual sensitivity.",
        createdAt: "2026-11-18T09:30:00Z",
        parentId: null,
        replies: [
          {
            id: "comm-1-1",
            authorName: "Sister Mary Daniel",
            authorEmail: "mary.d@example.com",
            content: "Amen brother Andrew! Let us keep our garments white and ready for our Lord.",
            createdAt: "2026-11-18T10:15:00Z",
            parentId: "comm-1",
          },
        ],
      },
      {
        id: "comm-2",
        authorName: "Evangelist Luke Eze",
        authorEmail: "luke.eze@example.com",
        content: "May the Lord continually grant our International Director wisdom to feed us with this undiluted truth.",
        createdAt: "2026-11-17T18:20:00Z",
        parentId: null,
        replies: [],
      },
    ],
  },
  {
    id: "post-2",
    slug: "serving-with-humility-and-purpose",
    category: "Church & leadership",
    title: "Serving with humility and purpose",
    excerpt:
      "A reflection on responsibility, care and faithfulness in Christian leadership.",
    body: `Christian leadership is not a platform for personal aggrandizement, titles, or financial enrichment. It is a basin and a towel.

When Jesus washed His disciples' feet in John 13, He gave us the eternal blueprint: "For I have given you an example, that ye should do as I have done to you."

The true mark of a leader in HOREMOW is not their eloquence or position, but their fear of God, their love for the flock, and their unswerving hatred for compromise and sin. When leaders walk in holiness, the whole assembly catches the fire of God.`,
    date: "14 Nov 2026",
    author: "Pastor Paul Rika",
    readTime: "7 min read",
    thumbnailUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951666/FB_IMG_1794950348661_bijric.jpg",
    metaTitle: "Serving with Humility and Purpose | HOREMOW Leadership",
    metaDescription: "The biblical marks of servant leadership in the church.",
    metaKeywords: "servant leadership, humility, ministers, church government, holiness",
    status: "Published",
    comments: [],
  },
  {
    id: "post-3",
    slug: "building-a-home-rooted-in-faith",
    category: "Family",
    title: "Building a home rooted in faith",
    excerpt:
      "Thoughts for families seeking to grow together in love, wisdom and spiritual maturity.",
    body: `The family is the bedrock of both church and society. If our homes are disorganized, prayerless, and filled with worldly strife, our public ministries become hollow hypocrisies.

In Joshua 24:15, the servant of God declared: "As for me and my house, we will serve the Lord." Let every husband love his wife in purity, let wives honor their husbands in Christ, and let parents diligently teach their children the commandments of God.`,
    date: "10 Nov 2026",
    author: "Mummy Linda Paul Rika",
    readTime: "6 min read",
    thumbnailUrl: "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951642/FB_IMG_1794949925011_nhzo0g.jpg",
    metaTitle: "Building a Home Rooted in Faith | HOREMOW Family Life",
    metaDescription: "Spiritual counsel for holy marriages and nurturing godly children in an ungodly generation.",
    metaKeywords: "christian marriage, family, godly children, mummy linda rika",
    status: "Published",
    comments: [],
  },
];

export const location = {
  name: "HOREMOW International Headquarters & Campground",
  address: "Kuje-Gwagwalada Road, Abuja, Federal Capital Territory, Nigeria",
  email: "info@horemow.com",
  phone: "+234 806 191 5797",
};
