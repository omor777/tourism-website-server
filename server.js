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

    app.get("/tourist_spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await touristSpotCollection.findOne(query);
      res.send(result);
    });

    app.get("/my_tourist_spot/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const cursor = touristSpotCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/tourist_spots", async (req, res) => {
      const { body } = req;
      const result = await touristSpotCollection.insertOne(body);
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
