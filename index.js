const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(cors());
const port = process.env.PORT || 8000;


//mentora
//QQSun7rl2aehKwcu


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const db = client.db("mentora");
    const courseCollection = db.collection("courseCollection");


    app.get("/courses", async (req, res) => {
        const cursor = courseCollection.find();
        const result = await cursor.toArray();
        // console.log(result);
        res.send(result);
    });

    app.get("/courses/:courseId", async (req, res) => {
        const {courseId} = req.params;
        const query = {_id: new ObjectId (courseId)};
        const course = await courseCollection.findOne(query);
        // console.log(course);
        res.send(course);
        
    })







    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World! ');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});