import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Appartement from './models/Appartement.js';
import Rating from './models/Rating.js';

const towns = [
  {
    name: 'Alger',
    coords: [
      [36.7538, 3.0588],
      [36.7669, 3.0408],
      [36.7372, 3.0865]
    ]
  },
  {
    name: 'Bejaia',
    coords: [
      [36.7509, 5.0567],
      [36.7421, 5.0843],
      [36.7615, 5.0792]
    ]
  },
  {
    name: 'Tizi Ouzou',
    coords: [
      [36.7169, 4.0497],
      [36.7112, 4.0364],
      [36.7244, 4.061]
    ]
  },
  {
    name: 'Jijel',
    coords: [
      [36.821, 5.7667],
      [36.8094, 5.7582],
      [36.8288, 5.7811]
    ]
  },
  {
    name: 'Annaba',
    coords: [
      [36.9, 7.7667],
      [36.8897, 7.7725],
      [36.9134, 7.7593]
    ]
  }
];

const users = [
  {
    fname: 'Nadia',
    lname: 'Mansouri',
    username: 'nadia.m',
    provider: 'local',
    password: 'password123',
    email: 'nadia@example.com',
    town: 'Alger',
    address: 'Hydra'
  },
  {
    fname: 'Karim',
    lname: 'Bouzid',
    username: 'karim.b',
    provider: 'local',
    password: 'password123',
    email: 'karim@example.com',
    town: 'Bejaia',
    address: 'Ihaddaden'
  },
  {
    fname: 'Sonia',
    lname: 'Ait Ali',
    username: 'sonia.a',
    provider: 'local',
    password: 'password123',
    email: 'sonia@example.com',
    town: 'Tizi Ouzou',
    address: 'Nouvelle Ville'
  }
];

const appartementTemplates = [
  {
    type: 'studio',
    price: 18000,
    surface: 45,
    description: 'Compact furnished studio close to daily services.'
  },
  {
    type: 'f2',
    price: 32000,
    surface: 72,
    description: 'Bright two-room apartment with balcony.'
  },
  {
    type: 'f3',
    price: 47000,
    surface: 98,
    description: 'Family apartment with open living area.'
  }
];

const ratings = [4, 5, 3, 4, 5];

async function populate() {
  await mongoose.connect(process.env.MONGO_URI);

  await Rating.deleteMany({});
  await Appartement.deleteMany({});
  await User.deleteMany({});

  const createdUsers = await User.insertMany(users);

  const appartements = towns.flatMap((town, townIndex) =>
    appartementTemplates.map((template, templateIndex) => {
      const [coordX, coordY] = town.coords[templateIndex];
      const owner = createdUsers[(townIndex + templateIndex) % createdUsers.length];
      const rating = ratings[(townIndex + templateIndex) % ratings.length];
      const ratersNbr = 1;

      return {
        address: `${templateIndex + 1} ${town.name} Centre`,
        town: town.name,
        price: template.price + townIndex * 2500,
        surface: template.surface + townIndex * 4,
        description: template.description,
        type: template.type,
        rateSum: rating,
        ratersNbr,
        ownerId: owner._id.toString(),
        coordX,
        coordY
      };
    })
  );

  const createdAppartements = await Appartement.insertMany(appartements);

  const ratingDocs = createdAppartements.map((appartement, index) => ({
    userID: createdUsers[index % createdUsers.length]._id.toString(),
    AppartementID: appartement._id.toString(),
    theRating: appartement.rateSum,
    date: new Date()
  }));

  await Rating.insertMany(ratingDocs);

  console.log(
    `Inserted ${createdUsers.length} users, ${createdAppartements.length} appartements, and ${ratingDocs.length} ratings.`
  );

  await mongoose.disconnect();
}

populate().catch(async (error) => {
  console.error('Populate failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
