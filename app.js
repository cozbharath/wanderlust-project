if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}


const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// ==============================
// Models & Utilities
// ==============================
const User = require("./models/user");
const ExpressError = require("./utils/ExpressError");
// ==============================
// Routers
// ==============================
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

// ==============================
// App Configuration
// ==============================
const app = express();
const dbUrl = process.env.ATLASDB_URL;
const secret = process.env.SECRET || "fallbacksecret";

// ==============================
// Database Connection
// ==============================
async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ==============================
// View Engine & Static Files
// ==============================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// ==============================
// Middleware Setup
// ==============================
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// ==============================
// Session Store Configuration
// ==============================
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret },
  touchAfter: 24 * 3600, // 1 day
});

store.on("error", (err) => {
  console.error("Session store error:", err);
});

const sessionOptions = {
  store,
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ==============================
// Passport Configuration
// ==============================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ==============================
// Global Middleware (Flash + Current User)
// ==============================
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ==============================
// Routes
// ==============================
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Optional: Redirect root to listings
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// ==============================
// Error Handling
// ==============================
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message, statusCode });
});

// ==============================
// Server Start
// ==============================
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
