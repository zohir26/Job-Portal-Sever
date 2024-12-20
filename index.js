require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// user: Job-Portal
// password: zp3RFJcoffKSZVKF

// Mongo DB connection

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.y1njy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();
        // Send a ping to confirm a successful connection

        // load data from server
        const jobsCollection = client.db('Job-Portal').collection('jobs')

        // await client.db("admin").command({ ping: 1 });

        app.get('/jobs',async(req,res)=>{
            const cursor = jobsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // details job 

        app.get('/jobs/:id',async(req,res)=>{
            const id =req.params.id;
            const query = {_id:new ObjectId(id)}
            const result = await jobsCollection.findOne(query)
            res.send(result)
        })

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('job is falling from sky')
})

app.listen(port, () => {
    console.log(`job is waiting at; ${port}`)
})