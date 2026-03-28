/*
- File: Movies.js
- Author: Elijah Heimsoth
- Date: 03/29/2026
- Assignment: WebAPI-HW3
- Class: CSCI 3916

Description: Mongoose Movie model with schema validation for title, releaseDate,
genre (enum), and actors (nested array). Connects to MongoDB Atlas.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit the process if the connection fails (optional)
  }
};

connectDB();

// Movie schema
var MovieSchema = new Schema({
    // Title of the movie — required, and indexed for fast lookups
    title: { type: String, required: true, index: true },

    // Release year — stored as a Number (not a Date), constrained to 1900-2100
    releaseDate: {
        type: Number,
        min: [1900, 'Must be greater than 1899'],
        max: [2100, 'Must be less than 2100']
    },

    // Genre — must be one of exactly these 10 strings
    genre: {
        type: String,
        enum: [
            'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
            'Horror', 'Mystery', 'Thriller', 'Western', 'Science Fiction'
        ],
    },

    // Actors — an array of subdocuments, each with actorName and characterName
    actors: [{
        actorName: String,
        characterName: String,
    }],
});

module.exports = mongoose.model('Movie', MovieSchema);