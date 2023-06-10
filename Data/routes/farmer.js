const express = require("express");
const router = express.Router();
const geolib = require("geolib");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const axios = require("axios");

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

const Farmer = require("../models/farmer");
const MarketData = require("../models/market");
const Customer = require("../models/customer");

const { geocode, isLoggedIn } = require("../middleware");

// router.post("/signup", catchAsync(async (req, res, next) => {
//   if(!req.body)throw new ExpressError("Invalid data",400)
//   const { firstName, lastName, email, location, username, password } = req.body;

//   const geocodeResult = await geocode(location);
//     const { lat, lng } = geocodeResult;
//     const markets = await MarketData.find({});
//     const distances = {};
//     markets.forEach((market) => {
//       market.locations.forEach((location) => {
//         const distance = geolib.getDistance(
//           { latitude: lat, longitude: lng },
//           { latitude: location.location.coordinates[0], longitude: location.location.coordinates[1] }
//         );
//         distances[`${market.name}-${location.name}`] = distance;
//       });
//     });
//     const farmer = new Farmer({
//       firstName,
//       lastName,
//       email,
//       username,
//       location: {
//         name:location,
//         type: "Point",
//         coordinates: [lng, lat],
//       },
//       marketDistances: distances,
//     });
//     const registeredFarmer = await Farmer.register(farmer, password);
//         // const {_id,marketDistances}=registeredFarmer
//           res.status(201).json({
//             registeredFarmer
//           })

//         req.login(registeredFarmer, (err) => {
//           if (err) return next(err);
//           // res.redirect("/marketdata");
//           // res.status(200).json({ success: true, message: "Farmer registered successfully" });
//         });

// }));
router.post("/signup", async (req, res, next) => {
  const { firstName, lastName, email, location, username, password } = req.body;
  const geocodeResult = await geocode(location);
  const { lat, lng } = geocodeResult;
  const markets = await MarketData.find({});
  const distances = {};
  async function calculateRoutingDistance(origin, destination) {
    const url = `http://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
    const response = await axios.get(url);
    const route = response.data.routes[0];
    return route.distance; // Distance in meters
  }
  for (const market of markets) {
    for (const location of market.locations) {
      const destination = {
        latitude: location.location.coordinates[0],
        longitude: location.location.coordinates[1],
      };
      const distance = await calculateRoutingDistance(
        { latitude: lat, longitude: lng },
        destination
      );
      distances[`${market.name}-${location.name}`] = distance;
    }
  }
  const farmer = new Farmer({
    firstName,
    lastName,
    email,
    username,
    location: {
      name: location,
      type: "Point",
      coordinates: [lng, lat],
    },
    marketDistances: distances,
  });

  const registeredFarmer = await Farmer.register(farmer, password);
  // const {_id,marketDistances}=registeredFarmer
  res.status(201).json({
    registeredFarmer,
  });

  req.login(registeredFarmer, (err) => {
    if (err) return next(err);
    // res.redirect("/marketdata");
    // res.status(200).json({ success: true, message: "Farmer registered successfully" });
  });
});

router.post(
  "/login",
  passport.authenticate("farmer", {
    failureRedirect: "/farmer/login",
    keepSessionInfo: true,
  }),
  async (req, res, next) => {
    const farmer = await Farmer.findById(req.user._id);
    res.status(200).json({ farmer });
  }
);

router.get("/getFarmer", isLoggedIn, async (req, res, next) => {
  const farmer = await Farmer.findById(req.user._id);
  res.status(200).json({ farmer });
});
router.post("/postProduct", isLoggedIn, async (req, res, next) => {
  const { type, quantity, price } = req.body;
  const farmer = await Farmer.findById(req.user._id);
  farmer.productListing.push({ type, quantity, price });
  await farmer.save();
  res.status(201).json({ message: "Product listed for sale successfully" });
});
router.get("/logout", (req, res, next) => {
  req.session.passport = null;
  res.status(200).json({
    message: "successfully logged out",
  });

  // res.redirect('/')
});

module.exports = router;
