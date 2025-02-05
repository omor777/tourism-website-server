require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6ze9kj8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const touristSpotCollection = client
      .db("touristSpotDB")
      .collection("touristSpot");

    const countriesCollection = client
      .db("touristSpotDB")
      .collection("countries");

    app.get("/tourist_spots/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = touristSpotCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/update_tourist_spot/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      console.log("query", query);
      const result = await touristSpotCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    app.get("/tourist_spots", async (_req, res) => {
      const result = await touristSpotCollection.find().toArray();
      res.send(result);
    });

    app.get("/sorted_tourist_spots", async (_req, res) => {
      const result = await touristSpotCollection
        .find()
        .sort({ average_cost: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/countries_tourist_spots/:country", async (req, res) => {
      const country = req.params.country;

      const query = { country_name: country };
      const result = await touristSpotCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/countries", async (req, res) => {
      const result = await countriesCollection.find().toArray();
      res.send(result);
    });

    app.post("/tourist_spots", async (req, res) => {
      const { body } = req;
      const result = await touristSpotCollection.insertOne(body);
      res.send(result);
    });

    app.put("/update_tourist_spot/:id", async (req, res) => {
      const id = req.params.id;
      const spot = req.body;
      console.log(spot);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateSpot = {
        $set: {
          tourist_spot_name: spot.tourist_spot_name,
          country_name: spot.country_name,
          location: spot.location,
          short_description: spot.short_description,
          average_cost: spot.average_cost,
          seasonality: spot.seasonality,
          travel_time: spot.travel_time,
          total_visitors_per_year: spot.total_visitors_per_year,
          photo_url: spot.photo_url,
        },
      };
      const result = await touristSpotCollection.updateOne(
        filter,
        updateSpot,
        options
      );
      res.send(result);
    });

    app.delete("/tourist_spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await touristSpotCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

// A simple get greet method
app.get("/", (req, res) => {
  res.send({ msg: `Welcome to tourism website!` });
});

//TODO: optional after deploy it will be deleted
app.listen(5000, () => {
  console.log("listen on port 5000");
});

// export the app for vercel serverless functions
module.exports = app;
