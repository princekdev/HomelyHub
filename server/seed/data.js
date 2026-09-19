// Realistic demo data. No real personal information is used.
// Image URLs point to placeholder/stock-style Unsplash sources so seeded
// properties render nicely without requiring a Cloudinary upload step.

const demoUsers = [
  { name: "Admin User", email: "admin@homelyhub.com", password: "Admin@123", role: "admin" },
  { name: "Rohan Sharma", email: "rohan.host@homelyhub.com", password: "Host@123", role: "host" },
  { name: "Ananya Verma", email: "ananya.host@homelyhub.com", password: "Host@123", role: "host" },
  { name: "Vikram Singh", email: "vikram.host@homelyhub.com", password: "Host@123", role: "host" },
  { name: "Priya Nair", email: "priya@homelyhub.com", password: "User@123", role: "user" },
  { name: "Aditya Kumar", email: "aditya@homelyhub.com", password: "User@123", role: "user" },
  { name: "Sneha Gupta", email: "sneha@homelyhub.com", password: "User@123", role: "user" },
];

// Lorem Picsum is used for demo/seed images because it serves stable, always-available
// placeholder photos keyed by a seed string - unlike source.unsplash.com, which is
// deprecated/unreliable and frequently fails to load, leaving broken thumbnails.
const img = (seed) => `https://picsum.photos/seed/homelyhub-${seed}/800/600`;

const cities = [
  { city: "Ranchi", state: "Jharkhand" },
  { city: "Patna", state: "Bihar" },
  { city: "Delhi", state: "Delhi" },
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Bangalore", state: "Karnataka" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Kolkata", state: "West Bengal" },
  { city: "Jaipur", state: "Rajasthan" },
  { city: "Goa", state: "Goa" },
];

const propertyTypes = [
  "Apartment",
  "House",
  "Villa",
  "Cottage",
  "Studio",
  "Hotel",
  "Resort",
  "Guest House",
];

const amenityPool = [
  "WiFi",
  "Parking",
  "Kitchen",
  "AC",
  "TV",
  "Washing Machine",
  "Pool",
  "Workspace",
  "Security",
];

const titleTemplates = [
  "Cozy {type} in the heart of {city}",
  "Modern {type} with great views, {city}",
  "Charming {type} near city center, {city}",
  "Spacious {type} perfect for families, {city}",
  "Budget-friendly {type} in {city}",
  "Luxury {type} experience in {city}",
];

const pickRandom = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const generateProperties = (hostIds, count = 18) => {
  const properties = [];
  for (let i = 0; i < count; i++) {
    const cityInfo = cities[i % cities.length];
    const type = propertyTypes[i % propertyTypes.length];
    const titleTemplate = titleTemplates[i % titleTemplates.length];
    const title = titleTemplate.replace("{type}", type).replace("{city}", cityInfo.city);
    const price = 1200 + (i % 10) * 850;

    properties.push({
      title,
      description: `A wonderful ${type.toLowerCase()} located in ${cityInfo.city}, ${cityInfo.state}. Perfect for a relaxing stay with easy access to local attractions, restaurants, and transport. Fully equipped for a comfortable visit whether you're traveling for work or leisure.`,
      propertyType: type,
      images: [
        { url: img(i * 3 + 1), publicId: "" },
        { url: img(i * 3 + 2), publicId: "" },
        { url: img(i * 3 + 3), publicId: "" },
      ],
      pricePerNight: price,
      cleaningFee: 200 + (i % 5) * 50,
      location: {
        address: `${100 + i} Main Road`,
        city: cityInfo.city,
        state: cityInfo.state,
        country: "India",
        postalCode: `${800000 + i * 37}`,
      },
      guests: 2 + (i % 6),
      bedrooms: 1 + (i % 4),
      beds: 1 + (i % 4),
      bathrooms: 1 + (i % 3),
      amenities: pickRandom(amenityPool, 3 + (i % 4)),
      host: hostIds[i % hostIds.length],
      rating: 0,
      reviewCount: 0,
    });
  }
  return properties;
};

module.exports = { demoUsers, generateProperties };
