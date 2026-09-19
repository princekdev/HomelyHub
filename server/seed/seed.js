require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Property = require("../models/Property");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const { demoUsers, generateProperties } = require("./data");

const destroy = process.argv.includes("--destroy");

const run = async () => {
  await connectDB();

  if (destroy) {
    await Promise.all([
      User.deleteMany(),
      Property.deleteMany(),
      Booking.deleteMany(),
      Review.deleteMany(),
    ]);
    console.log("All HomelyHub demo data destroyed.");
    process.exit(0);
  }

  await Promise.all([
    User.deleteMany(),
    Property.deleteMany(),
    Booking.deleteMany(),
    Review.deleteMany(),
  ]);

  // Create users one by one so password hashing hooks run
  const createdUsers = [];
  for (const u of demoUsers) {
    const user = await User.create(u);
    createdUsers.push(user);
  }

  const hosts = createdUsers.filter((u) => u.role === "host");
  const users = createdUsers.filter((u) => u.role === "user");

  const propertiesData = generateProperties(hosts.map((h) => h._id), 18);
  const properties = await Property.insertMany(propertiesData);

  // A handful of sample bookings across different statuses
  const sampleBookings = [];
  const today = new Date();
  const addDays = (d, n) => {
    const date = new Date(d);
    date.setDate(date.getDate() + n);
    return date;
  };

  for (let i = 0; i < 8; i++) {
    const property = properties[i % properties.length];
    const guest = users[i % users.length];
    const checkIn = addDays(today, 5 + i * 4);
    const checkOut = addDays(checkIn, 2 + (i % 3));
    const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const subtotal = property.pricePerNight * nights;
    const serviceFee = Math.round(subtotal * 0.05);
    const statuses = ["pending", "confirmed", "completed", "cancelled"];

    sampleBookings.push({
      user: guest._id,
      property: property._id,
      host: property.host,
      checkIn: i % 2 === 0 ? addDays(today, -20 - i) : checkIn,
      checkOut: i % 2 === 0 ? addDays(today, -18 - i) : checkOut,
      guests: 2,
      nights,
      pricePerNight: property.pricePerNight,
      cleaningFee: property.cleaningFee,
      serviceFee,
      totalPrice: subtotal + property.cleaningFee + serviceFee,
      status: i % 2 === 0 ? "completed" : statuses[i % statuses.length],
      paymentStatus: i % 2 === 0 ? "demo_paid" : "pending",
    });
  }

  const bookings = await Booking.insertMany(sampleBookings);

  // Reviews for completed bookings
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const comments = [
    "Wonderful stay, very clean and exactly as described!",
    "Great location and a very responsive host.",
    "Comfortable place, would definitely book again.",
    "Good value for money, minor issues with WiFi.",
  ];

  for (let i = 0; i < completedBookings.length; i++) {
    const booking = completedBookings[i];
    await Review.create({
      user: booking.user,
      property: booking.property,
      booking: booking._id,
      rating: 4 + (i % 2),
      comment: comments[i % comments.length],
    });

    const stats = await Review.aggregate([
      { $match: { property: booking.property } },
      { $group: { _id: "$property", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    if (stats.length) {
      await Property.findByIdAndUpdate(booking.property, {
        rating: Math.round(stats[0].avg * 10) / 10,
        reviewCount: stats[0].count,
      });
    }
  }

  console.log("HomelyHub demo data seeded successfully.\n");
  console.log("=== Demo credentials ===");
  console.log("Admin  -> admin@homelyhub.com / Admin@123");
  console.log("Host   -> rohan.host@homelyhub.com / Host@123");
  console.log("Host   -> ananya.host@homelyhub.com / Host@123");
  console.log("User   -> priya@homelyhub.com / User@123");
  console.log("========================\n");

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
