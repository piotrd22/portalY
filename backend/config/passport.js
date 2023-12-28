const passport = require("passport");
const passportLocal = require("passport-local");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const validateUser = (username, password, done) => {
  User.findOne({ username })
    .then((user) => {
      if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            done(err);
          } else if (result) {
            done(null, user);
          } else {
            done(null, null);
          }
        });
      } else {
        done(null, null);
      }
    })
    .catch((err) => {
      console.error(err.message);
      done(err);
    });
};

passport.use(new passportLocal.Strategy(validateUser));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
