// 90+ is an Opesi Mansion product. Sales, sign-up, blog, and legal pages live on the Opesi Mansion site.
const maker = "https://www.opesimansion.com";

export const product = {
  name: "90+",
  domain: "9ntyplus.com",
  maker: "Opesi Mansion",
  makerLegalName: "OPESI MANSION LTD",
  makerUrl: maker,
} as const;

// Every link to the Opesi Mansion site carries campaign tags, so enquiries that start on 90+ are attributed
// to it there (utm_source=9ntyplus). Pass a placement to tell buttons apart, such as "hero-form" or "header".
export function tagged(href: string, placement?: string) {
  const url = new URL(href);
  if (url.origin !== maker) return href;
  url.searchParams.set("utm_source", "9ntyplus");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "90plus-site");
  if (placement) url.searchParams.set("utm_content", placement);
  return url.toString();
}

export const links = {
  getStarted: tagged(`${maker}/get-started`),
  getStartedFleet: tagged(`${maker}/get-started#solution=fleet`),
  sales: tagged(`${maker}/sales`),
  blog: tagged(`${maker}/blog`),
  careers: tagged(`${maker}/careers`),
  privacy: tagged(`${maker}/privacy-policy`),
  terms: tagged(`${maker}/terms-of-service`),
  dataDeletion: tagged(`${maker}/data-deletion`),
  x: "https://x.com/opsmansion",
  linkedin: "https://www.linkedin.com/company/opesi-mansion/",
} as const;

// Calls to action, tagged with where they sit on the page.
export const earlyAccess = (placement: string) => tagged(`${maker}/get-started#solution=fleet`, placement);
export const talkToSales = (placement: string) => tagged(`${maker}/sales`, placement);

export type NavItem = { label: string; href: string; description?: string };

// Header menus follow the Wialon structure: product, solutions, resources, company, then pricing.
export const navigation: { label: string; items: NavItem[] }[] = [
  {
    label: "Product",
    items: [
      { label: "Live GPS tracking", href: "/#functionality", description: "Every vehicle and asset on one live map." },
      { label: "Routing and dispatch", href: "/#functionality", description: "Plan routes with fewer kilometres." },
      { label: "Driver behavior", href: "/#functionality", description: "Speeding and harsh driving alerts." },
      { label: "Reports and insights", href: "/#suite", description: "Trips, time on site, and costs." },
    ],
  },
  {
    label: "Solutions",
    items: [
      { label: "Delivery fleets", href: "/#industries" },
      { label: "Trailers and cargo", href: "/#industries" },
      { label: "Construction and equipment", href: "/#industries" },
      { label: "Fuel monitoring", href: "/#industries" },
      { label: "Fleet maintenance", href: "/#industries" },
      { label: "Public transport", href: "/#industries" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "FAQs", href: "/#faqs", description: "Answers about setup, pricing, and drivers." },
      { label: "Blog", href: links.blog, description: "Articles from Opesi Mansion." },
      { label: "Support", href: links.sales, description: "Talk to the team behind 90+." },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "About Opesi Mansion", href: tagged(`${maker}/`), description: "The company that builds 90+." },
      { label: "Careers", href: links.careers },
      { label: "Contact", href: links.sales },
    ],
  },
];

export const industries = [
  { title: "Delivery fleets", description: "Live locations and accurate arrival times for every drop.", image: "/images/vehicles.jpg", alt: "A truck on an open highway beneath mountains." },
  { title: "Trailers and cargo", description: "Door, temperature, and location status for every load.", image: "/images/cargo.jpg", alt: "Shipping containers stacked across a port yard." },
  { title: "Construction and equipment", description: "Find machines across sites and see how often they run.", image: "/images/equipment.jpg", alt: "An aerial view of a construction site with cranes and an excavator." },
  { title: "Driver behavior", description: "Speeding and harsh driving alerts that support coaching.", image: "/images/speeding.jpg", alt: "The view from a driver's seat onto a highway at dusk." },
  { title: "Fuel monitoring", description: "Spot idling and long routes that waste fuel.", image: "/images/routes.jpg", alt: "Two straight roads running through a palm plantation." },
  { title: "Fleet maintenance", description: "Service reminders based on real distance and engine hours.", image: "/images/live-map.jpg", alt: "A highway cutting through dense forest, seen from above." },
  { title: "Public transport", description: "Keep buses on schedule and share live arrival times.", image: "/images/hero-interchange.jpg", alt: "An aerial view of a multi-level highway interchange." },
  { title: "Field services", description: "Send the nearest technician and confirm time on site.", image: "/images/vehicles.jpg", alt: "A service vehicle travelling on a highway." },
] as const;

export const footerColumns: { title: string; items: NavItem[] }[] = [
  { title: "Product", items: [...navigation[0].items, { label: "Pricing", href: links.sales }, { label: "Early Access", href: links.getStartedFleet }] },
  { title: "Solutions", items: navigation[1].items },
  { title: "Resources", items: navigation[2].items },
  { title: "Company", items: [...navigation[3].items, { label: "Opesi Mansion", href: tagged(`${maker}/`) }] },
];
