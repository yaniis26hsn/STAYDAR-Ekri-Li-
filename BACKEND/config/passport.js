import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Check if user exists by Google ID
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        // 2. Check if user exists by Email (but was created locally)
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          user.googleId = profile.id;
          user.provider = "google"; // Update provider
          await user.save();
        } else {
          // 3. Create new Google User
          user = await User.create({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            fname: profile.name.givenName,
            lname: profile.name.familyName,
            provider: "google"
          });
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));