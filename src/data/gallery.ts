import { CONFERENCE_GALLERY_IMAGES, type ConferenceImage } from "./mediaAssets";

export type GalleryItem = {
  id: string;
  title: string;
  category: "Conferences" | "Crusades" | "Worship" | "Ministers";
  description: string;
  image: string;
  alt: string;
};

export const galleryItems: GalleryItem[] = CONFERENCE_GALLERY_IMAGES.map((img: ConferenceImage) => ({
  id: img.id,
  title: img.title,
  category: img.category,
  description: img.description,
  image: img.url,
  alt: `HOREMOW - ${img.title} (${img.category})`,
}));
