/*
- File: server.js
- Author: Elijah Heimsoth
- Date: 03/29/2026
- Assignment: WebAPI-HW3
- Class: CSCI 3916

Description: Express REST API for Movie collection with JWT authentication.
Supports full CRUD operations on /movies and /movies/:movieparameter routes.
Signup and signin routes handle user registration and JWT token generation.
 */
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const authJwtController = require('./auth_jwt'); // You're not using authController, consider removing it
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./Users');
const Movie = require('./Movies'); // You're not using Movie, consider removing it

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

const router = express.Router();

// Removed getJSONObjectForMovieRequirement as it's not used

router.post('/signup', async (req, res) => { // Use async/await
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ success: false, msg: 'Please include both username and password to signup.' }); // 400 Bad Request
  }

  try {
    const user = new User({ // Create user directly with the data
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
    });

    await user.save(); // Use await with user.save()

    res.status(201).json({ success: true, msg: 'Successfully created new user.' }); // 201 Created
  } catch (err) {
    if (err.code === 11000) { // Strict equality check (===)
      return res.status(409).json({ success: false, message: 'A user with that username already exists.' }); // 409 Conflict
    } else {
      console.error(err); // Log the error for debugging
      return res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
    }
  }
});


router.post('/signin', async (req, res) => { // Use async/await
  try {
    const user = await User.findOne({ username: req.body.username }).select('name username password');

    if (!user) {
      return res.status(401).json({ success: false, msg: 'Authentication failed. User not found.' }); // 401 Unauthorized
    }

    const isMatch = await user.comparePassword(req.body.password); // Use await

    if (isMatch) {
      const userToken = { id: user._id, username: user.username }; // Use user._id (standard Mongoose)
      const token = jwt.sign(userToken, process.env.SECRET_KEY, { expiresIn: '1h' }); // Add expiry to the token (e.g., 1 hour)
      res.json({ success: true, token: 'JWT ' + token });
    } else {
      res.status(401).json({ success: false, msg: 'Authentication failed. Incorrect password.' }); // 401 Unauthorized
    }
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
  }
});

router.route('/movies')
    .get(authJwtController.isAuthenticated, async (req, res) => {
        try {
            // Movie.find() with no arguments returns ALL documents in the collection
            const movies = await Movie.find();

            // Return the array directly — the Mocha test expects res.body to BE an array
            res.status(200).json(movies);
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, msg: 'Something went wrong.' });
        }
    })
    .post(authJwtController.isAuthenticated, async (req, res) => {
        // Validate that the request body contains all required fields
        if (!req.body.title || !req.body.releaseDate || !req.body.genre || !req.body.actors) {
            return res.status(400).json({
                success: false,
                msg: 'Please include title, releaseDate, genre, and actors.'
            });
        }

        // Business rule: each movie must have at least 3 actors
        if (req.body.actors.length < 3) {
            return res.status(400).json({
                success: false,
                msg: 'Movies must have at least 3 actors.'
            });
        }

        try {
            // Create a new Movie document from the request body
            const movie = new Movie({
                title: req.body.title,
                releaseDate: req.body.releaseDate,
                genre: req.body.genre,
                actors: req.body.actors,
            });

            // .save() triggers Mongoose schema validation (required, enum, min/max)
            // then writes the document to the 'movies' collection in Atlas
            const savedMovie = await movie.save();

            // Return 201 Created with the saved movie object
            res.status(201).json({ movie: savedMovie });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, msg: 'Something went wrong.' });
        }
    })
    .put(authJwtController.isAuthenticated, async (req, res) => {
        res.status(405).json({ success: false, msg: 'PUT not supported on /movies. Use /movies/:movieparameter.' });
    })
    .delete(authJwtController.isAuthenticated, async (req, res) => {
        res.status(405).json({ success: false, msg: 'DELETE not supported on /movies. Use /movies/:movieparameter.' });
    });

router.route('/movies/:movieparameter')
    .get(authJwtController.isAuthenticated, async (req, res) => {
        try {
            // findOne() returns a single document matching the filter, or null
            const movie = await Movie.findOne({ title: req.params.movieparameter });

            if (!movie) {
                return res.status(404).json({ success: false, msg: 'Movie not found.' });
            }

            res.status(200).json(movie);
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, msg: 'Something went wrong.' });
        }
    })
    .put(authJwtController.isAuthenticated, async (req, res) => {
        try {
            // findOneAndUpdate: find by title, apply updates from req.body,
            // { new: true } returns the document AFTER the update (not before)
            const movie = await Movie.findOneAndUpdate(
                { title: req.params.movieparameter },
                req.body,
                { new: true }
            );

            if (!movie) {
                return res.status(404).json({ success: false, msg: 'Movie not found.' });
            }

            res.status(200).json({ success: true, msg: 'Movie updated.', movie: movie });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, msg: 'Something went wrong.' });
        }
    })
    .delete(authJwtController.isAuthenticated, async (req, res) => {
        try {
            // findOneAndDelete finds and removes the document, returning what was deleted
            const movie = await Movie.findOneAndDelete({ title: req.params.movieparameter });

            if (!movie) {
                return res.status(404).json({ success: false, msg: 'Movie not found.' });
            }

            res.status(200).json({ success: true, msg: 'Movie deleted.', movie: movie });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, msg: 'Something went wrong.' });
        }
    })
    .post(authJwtController.isAuthenticated, async (req, res) => {
        // POST on a specific movie doesn't make sense — create movies at POST /movies
        res.status(405).json({ success: false, msg: 'POST not supported on /movies/:movieparameter. Use POST /movies.' });
    });

app.use('/', router);

const PORT = process.env.PORT || 8080; // Define PORT before using it
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // for testing only