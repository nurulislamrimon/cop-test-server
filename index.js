const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { decode: decoded } = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.af7c8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const membersCollection = client.db('copMembers').collection('member');

        app.get('/finance', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = membersCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })


        app.get('/members', async (req, res) => {
            const query = {};
            const options = {
                sort: { mNo: 1 }
            }
            const cursor = membersCollection.find(query, options);
            const result = await cursor.toArray();
            console.log('all members responding');
            res.send(result)
        })
        app.get('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await membersCollection.findOne(query);
            res.send(result)

            console.log(query, 'is queried');
        })
        app.put('/user/:id', async (req, res) => {
            const id = req.params.id;
            const newUserData = req.body;
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    mNo: newUserData.mNo,
                    name: newUserData.name,
                    aspectRatio: newUserData.aspectRatio,
                    father: newUserData.father,
                    address: newUserData.address,
                    photo: newUserData.photo,
                    email: newUserData.email,
                    mobile: newUserData.mobile,
                    totalDeposit: newUserData.totalDeposit,
                }
            }
            const result = await membersCollection.updateOne(filter, updateDoc, option)
            res.send(result);
            console.log(newUserData, "is updated");
            // res.send(id)
        })
        app.post('/login', (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.JW_token, {
                expiresIn: '1d'
            })
            res.send({ accessToken })
            console.log(user);
        })

    } finally { }
}
run().catch(console.log)


app.get('/', (req, res) => {
    res.send('home');
    console.log('server running');
})
app.listen(port, () => {
    console.log(`port is ${port}`);
})