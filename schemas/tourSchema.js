const mongoose = require("mongoose");
const ObjectID = require("mongoose").Types.ObjectId;

const tourSchema = mongoose.Schema({
  userId: {
    type: ObjectID,
    max: 100,
  },
  title: {
    type: String,
    max: 100,
  },
  link: {
    type: String,
    max: 999999999,
  },
});

module.exports = {
  Tour: mongoose.model("Tour", tourSchema),
};
