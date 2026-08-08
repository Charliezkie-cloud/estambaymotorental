/**
 * Centralized business information for Estambay Moto Rentals.
 * Prefer importing from here instead of hardcoding contact, hours, or map details.
 */

export interface BusinessHours {
  /** Full display string shown in location / contact sections */
  label: string;
  /** Short badge / CTA label (e.g. "24/7 Service") */
  shortLabel: string;
  /** Whether the business operates around the clock */
  is24_7: boolean;
}

export interface BusinessSocialLinks {
  facebook: string;
  tiktok: string;
}

export interface BusinessMaps {
  /** Google Maps place URL opened in a new tab */
  placeUrl: string;
  /** Google Maps embed iframe src */
  embedUrl: string;
}

export interface BusinessInformation {
  name: string;
  shortName: string;
  address: string;
  /** City name used in marketing copy (e.g. "Cebu City") */
  city: string;
  /** Shorter location label for nav / compact UI (e.g. "Cebu City, Philippines") */
  locationLabel: string;
  phone: string;
  /** Digits-only phone for tel: links */
  phoneTel: string;
  email: string;
  businessHours: BusinessHours;
  maps: BusinessMaps;
  social: BusinessSocialLinks;
}

export const businessInformation: BusinessInformation = {
  name: "Estambay Moto Rentals",
  shortName: "Estambay Moto",
  address: "416 Candido Padilla Street, Cebu City, Philippines, 6000",
  city: "Cebu City",
  locationLabel: "Cebu City, Philippines",
  phone: "0910 957 2971",
  phoneTel: "09109572971",
  email: "aj.dano.32@gmail.com",
  businessHours: {
    label: "24 Hours a day / 7 Days a week",
    shortLabel: "24/7 Service",
    is24_7: true,
  },
  maps: {
    placeUrl:
      "https://www.google.com/maps/place/Estambay+Moto+Rental/@10.292249,123.883894,1344m/data=!3m2!1e3!4b1!4m6!3m5!1s0x33a99d005578dcad:0xe6670b6ca249f304!8m2!3d10.292249!4d123.883894!16s%2Fg%2F11m_38jy_y?entry=ttu&g_ep=EgoyMDI2MDgwMy4wIKXMDSoASAFQAw%3D%3D",
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3925.3941427189196!2d123.883894!3d10.292249!2m3!1f0!0!f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a99d005578dcad%3A0xe6670b6ca249f304!2sEstambay%20Moto%20Rental!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph",
  },
  social: {
    facebook: "https://www.facebook.com/Estambaymotorentals",
    tiktok: "https://www.tiktok.com/@estambay02",
  },
};
