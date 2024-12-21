require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.y1njy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const jobsCollection = client.db('Job-Portal').collection('jobs');
    const jobApplicationCollection = client.db('Job-Portal').collection('job_applications');

    app.get('/jobs', async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { hr_email: email };
      }

      const cursor = jobsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    app.post('/jobs', async (req, res) => {
      const job = req.body;
      const result = await jobsCollection.insertOne(job);
      res.send(result);
    });

    app.post('/job-applications', async (req, res) => {
      const application = req.body;
      const result = await jobApplicationCollection.insertOne(application);

      const id = application.job.id;
      const query = { _id: new ObjectId(id) };
      const job = await jobsCollection.findOne(query);

      let count = 0;
      if (job.applicationCount) {
        count = job.applicationCount + 1;
      } else {
        count = 1;
      }

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { applicationCount: count }
      };

      await jobsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get('/job-applications', async (req, res) => {
      const email = req.query.email;
      const query = { applicant_email: email };

      try {
        const result = await jobApplicationCollection.find(query).toArray();

        for (const application of result) {
          const query1 = { _id: new ObjectId(application.job_id) };
          const job = await jobsCollection.findOne(query1);
          if (job) {
            application.title = job.title;
            application.company = job.company;
            application.location = job.location;
          }
        }

        res.send(result);
      } catch (error) {
        console.error("Error fetching job applications:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('job is falling from sky');
});

app.listen(port, () => {
  console.log(`job is waiting at ${port}`);
});
