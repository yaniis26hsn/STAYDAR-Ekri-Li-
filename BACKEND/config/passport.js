import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback" // This must match exactly what you put in Google Console
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Check if the user already exists in your DB by their Google ID
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        // 2. If not, check if they exist by email (maybe they registered normally before)
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Update existing user with their googleId
          user.googleId = profile.id;
          await user.save();
        } else {
          // 3. Brand new user? Create them!
          user = await User.create({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            // Password isn't needed for Google users
          });
        }
      }
      // 4. Pass the user to the next step
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));