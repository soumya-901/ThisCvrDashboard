const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const todoHandler = require("./routeHandler/todoHandler");
const userHandler = require("./routeHandler/userHandler");
const tourHandler = require("./routeHandler/tourHandler");
const errors = require("./middleware/error");

const port = process.env.PORT || 5000;
// express middleware------>
const app = express();
require("dotenv").config();

const corsConfig = {
  origin: true,
  Credentials: true,
};
app.use(cors());
// app.options("*", cors(corsConfig));

// const corsConfig = {
//   origin: "*",
//   Credentials: true,
//   allowedHeaders:
//     "Origin, X-Requested-With, x-auth-token, Content-Type, Accept, Authorization",
//   methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
// };
// app.use(cors(corsConfig));

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,PATCH,DELETE");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, x-auth-token, Content-Type, Accept, Authorization"
//   );
//   res.header("Access-Control-Expose-Headers", "x-auth-token, Authorization");

//   next();
// });

app.use(express.json());

// Database connected with mongoose-------------->
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hpwptl6.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => console.log("Connected to mongoose Successfully"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.status(200).send("ThisCVR Server is Running");
});

// application routes-------->
// app.use("/todo", todoHandler);
app.use("/auth", userHandler);
app.use("/tours", tourHandler);

// database connection with mongoose-------->
const errorHandler = (err, req, res, next) => {
  if (res.headerSent) {
    return next(err);
  }
  res.status(500).json({ error: err });
};
app.use(errorHandler);
app.use(errors);

app.listen(port, () => {
  console.log(` App listening on port ${port}`);
});
