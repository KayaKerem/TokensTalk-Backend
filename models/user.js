const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    wallet_address: {
      type: String,
      required: true,
    },
    avatar_url: {
      type: String,
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    nfts: [
      {
        collection: {
          type: String,
        },
        contract_address: {
          type: String,
        },
        name: {
          type: String,
        },
        image_url: {
          type: String,
        },
        description: {
          type: String,
        },
      },
    ],
  },

  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
