const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: String,
    image: {
      url: String,
      filename: String,
    },
    price: {
      type: Number,
      min: [0, "Price must be a positive number"]
    },
    location: String,
    reviews: [   // ✅ fixed field name
      {
        type: Schema.Types.ObjectId,
        ref: "Review"
      }
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Optional: Slug virtual
listingSchema.post("findOneAndDelete", async (listing) =>{
  if(listing){
    await Review.deleteMany({_id: {$in: listing.reviews}})
  };
});



const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
