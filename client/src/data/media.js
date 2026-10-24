// Media & static catalog data (videos from Pexels CDN, posters from Unsplash)
// NOTE: HD (2048) variants used everywhere — 4K UHD files were 4-5x heavier
// (hero was 28MB!) and crawled on phones. DCI-HD looks identical on web.
const px = (id, suffix) => `https://videos.pexels.com/video-files/${id}/${id}-${suffix}.mp4`;
const poster = (id) => `https://images.unsplash.com/${id}?w=1200&q=70&auto=format&fit=crop`;

export const HERO_VIDEO = px("9512045", "hd_2048_1080_25fps"); // 6MB (was 28MB 4K)
export const HERO_POSTER = poster("photo-1441986300917-64674bd600d8");
// Men's banner: HD variant (2 MB) — 4K original was 70 MB and stuttered on the 340px banner strip
export const MEN_BANNER_VIDEO = px("3873059", "hd_1920_1080_25fps");
// Women's banner: 1440×2732 variant (21 MB) — lighter than the 4K portrait original
export const WOMEN_BANNER_VIDEO = px("9512048", "hd_1080_2048_25fps");

export const HOME_FILM_STRIP = [
  { id: "fabric", title: "Fabric in Motion", desc: "Silk flowing against a soft white studio", tag: "Craft", url: px("8102666", "hd_2048_1080_25fps"), poster: poster("photo-1434389677669-e08b4cac3105"), orientation: "landscape" },
  { id: "denim", title: "Denim in Motion", desc: "Street-style denim choreography", tag: "Denim", url: px("3873059", "hd_1920_1080_25fps"), poster: poster("photo-1542272604-787c3835535d"), orientation: "landscape" },
  { id: "runway", title: "Runway Nights", desc: "Models lighting up the catwalk", tag: "Runway", url: px("9511841", "hd_2048_1080_25fps"), poster: poster("photo-1483985988355-763728e1935b"), orientation: "landscape" },
];

export const FASHION_VIDEOS = [
  { id: "runway-classics", title: "Runway Classics", desc: "Iconic catwalk moments from the VASTRA atelier show — sharp tailoring, bold walks.", tag: "Runway", url: px("9511841", "hd_2048_1080_25fps"), poster: poster("photo-1483985988355-763728e1935b"), orientation: "landscape" },
  { id: "fabric-story", title: "The Fabric Story", desc: "A single piece of silk dances in slow motion — see how our fabrics come alive.", tag: "Craft", url: px("8102666", "hd_2048_1080_25fps"), poster: poster("photo-1434389677669-e08b4cac3105"), orientation: "landscape" },
  { id: "red-statement", title: "Red Statement", desc: "A bold red suit crosses the streets — power dressing, redefined.", tag: "Street", url: px("4937476", "hd_2048_1080_25fps"), poster: poster("photo-1469334031218-e382a71b716b"), orientation: "landscape" },
  { id: "denim-diaries", title: "Denim Diaries", desc: "Three dancers, one denim mood — our stretch-denim collection in full motion.", tag: "Denim", url: px("3873059", "hd_1920_1080_25fps"), poster: poster("photo-1542272604-787c3835535d"), orientation: "landscape" },
  { id: "black-dress", title: "Black Dress Elegance", desc: "Timeless little black dress on a candle-lit runway. Elegance never shouts.", tag: "Evening", url: px("9510025", "hd_2048_1080_25fps"), poster: poster("photo-1539109136881-3be0616acf4b"), orientation: "landscape" },
  { id: "floral-runway", title: "Floral on the Runway", desc: "A floral gown takes the runway — spring collection showcase.", tag: "Runway", url: px("9512045", "hd_2048_1080_25fps"), poster: poster("photo-1515886657613-9f3515b0c78f"), orientation: "landscape" },
  { id: "street-portrait", title: "Street Portraits", desc: "Beanies, yellow jackets and city windows — street style captured up close.", tag: "Street", url: px("2795405", "hd_1080_1920_25fps"), poster: poster("photo-1495385794356-15371f348c31"), orientation: "portrait" },
  { id: "white-on-black", title: "White on Black", desc: "A white dress against a black studio backdrop — pure contrast, pure drama.", tag: "Studio", url: px("10140479", "hd_1080_2048_25fps"), poster: poster("photo-1485968579580-b6d095142e6e"), orientation: "portrait" },
];

export const SUBCATEGORIES = {
  MEN: [
    { value: "tshirts", label: "T-Shirts" },
    { value: "shirts", label: "Shirts" },
    { value: "jeans", label: "Jeans" },
    { value: "jackets", label: "Jackets" },
    { value: "hoodies", label: "Hoodies" },
    { value: "blazers", label: "Blazers" },
    { value: "suits", label: "Suits" },
    { value: "ethnic", label: "Ethnic" },
  ],
  WOMEN: [
    { value: "dresses", label: "Dresses" },
    { value: "jeans", label: "Jeans" },
    { value: "tshirts", label: "Tops & Tees" },
    { value: "jackets", label: "Jackets" },
    { value: "coordsets", label: "Co-ord Sets" },
    { value: "ethnic", label: "Ethnic" },
  ],
};

export const MEN_WOMEN_CATEGORY_IMAGES = {
  MEN: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=1000&q=80&auto=format&fit=crop",
  WOMEN: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&q=80&auto=format&fit=crop",
};

export const SALE_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80&auto=format&fit=crop";

export const FREE_SHIP_THRESHOLD = 1999;
export const SHIPPING_FEE = 99;

export function formatINR(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
