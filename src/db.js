const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: {
    type: String,
    required: true
  },
  previously_check_in: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'check_in'
  }
});

const CheckInSchema = new mongoose.Schema({
  spot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'place'
  },
  time: Date,
  tip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tip'
  },
  rating: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'rating'
  },
});

const PlaceSchema = new mongoose.Schema({
  name: String,
  address: String,
  place_id: String,
  lat: Number,
  lng: Number,
  category: String,
  ratings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'rating'
  }],
  tips: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tip'
  }],
  check_ins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'check_in'
  }],
});

const TipSchema = new mongoose.Schema({
  comment: String,
  tipper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
});

const RatingSchema = new mongoose.Schema({
  like: Number,
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
});

mongoose.model('User', UserSchema);
mongoose.model('CheckIn', CheckInSchema);
mongoose.model('Place', PlaceSchema);
mongoose.model('Tip', TipSchema);
mongoose.model('Rating', RatingSchema);

mongoose.connect('mongodb://localhost:27017/large-scale-project', function (err) {
  if (err) throw err;
  console.log('Connected to MongoDB');
});
