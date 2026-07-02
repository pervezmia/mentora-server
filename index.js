const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(cors());
const port = process.env.PORT || 8000;

//mentora
//QQSun7rl2aehKwcu

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
const uri = process.env.MONGO_DB_URI;


const JWKS = createRemoteJWKSet(
      new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
      // new URL('http://localhost:3000/api/auth/jwks')
    )
    // console.log(JWKS, "JWKS");

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const logger = (req, res, next) => {
  // console.log(req.params,"from first");
  console.log(`${req.method} | ${req.url}`);
  next();
};

const verifyToken = async (req, res, next) => {
  const { authorization } = req.headers;
  // console.log(req.headers, "from verify token");
  const token = authorization?.split(" ")[1];
  // console.log(token);

  if(!token){
    return res.status(401).json({message: "Unauthorize"});
  }

  try {
    const JWKS = createRemoteJWKSet(
      new URL('http://localhost:3000/api/auth/jwks')
    )
    const { payload } = await jwtVerify(token, JWKS)
    // console.log(payload, "pay load"); // user info
    
    req.user = payload;
    console.log(req.user, "r u");

    next();

  } catch (error) {
    console.error('Token validation failed:', error)
    return res.status(401).json({message: "Unauthorize"});
  }


  
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const db = client.db("mentora");
    const courseCollection = db.collection("courseCollection");

    app.get("/courses", async (req, res) => {
      console.log(req.query);
      const {search} = req.query ;
      console.log(search,"ssss");

      let cursor;
      //cursor er kaj ta hoi nai skip kore gelam 
      if(search){

        cursor = courseCollection.find({ title: { $eq: "Stainless Steel Cookware Set updated version" }}).toArray();
        console.log(cursor);
        res.send({});
      } else {
        cursor = courseCollection.find();

      }
      // const cursor = courseCollection.find();
      const result = await cursor.toArray();
      console.log(result,"search re");
      res.send(result);
    });

    app.get("/featured", async (req, res) => {
      const cursor = courseCollection.find().limit(4);
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });

    app.get("/courses/:courseId", logger, verifyToken, async (req, res) => {

      console.log(req.user, "req user");

      const { courseId } = req.params;
      const query = { _id: new ObjectId(courseId) };
      const course = await courseCollection.findOne(query);
      // console.log(course);
      res.send(course);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World! ");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
