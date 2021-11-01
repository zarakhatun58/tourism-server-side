const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o0hj4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log('paysi', uri);
async function run() {
    try {
        await client.connect();
        console.log('conneckt todad');
        const database = client.db('Turista');
        const BookingCollection = database.collection('services');
        const orderCollection = database.collection("bookings");


        //post api for services insert
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log('hit the post api', service);
            const result = await BookingCollection.insertOne(service);
            console.log(result);
            res.json(result)
        });


        //GET API for show data
        app.get('/services', async (req, res) => {
            const cursor = BookingCollection.find({}).limit(6);
            const services = await cursor.toArray();
            res.send(services);
        });

        // GET Single Service id
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const service = await BookingCollection.findOne(query);
            res.json(service);
        })

        // Add Bookings API
        app.post('/Booking', async (req, res) => {
            const Booking = req.body;
            const result = await orderCollection.insertOne(Booking);
            res.json(result);
        })

         // show my Bookings
        app.get('/Bookings', async (req, res) => {
            const cursor = orderCollection.find({});
            const product = await cursor.toArray();
            res.send(product);
        });

         // cancel an Booking
        app.delete('/Bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            console.log('deleting user with id ', result);
            res.json(result);
          })

            // dynamic api for update products
            app.get('/Bookings/:id', async (req, res) => {
                const id = req.params.id;
                const query = { _id: ObjectId(id) };
                const Booking = await orderCollection.findOne(query);
                console.log('load user with id: ', id);
                res.send(Booking);
            })


        //update status
        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const updatedBooking = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
            $set: {
                status: updatedBooking.status,
            },
        };
        const result = await orderCollection.updateOne(filter, updateDoc, options)
        console.log('updating', id)
        res.json(result)
        })

           
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running Booking delivery  server')
})
app.listen(port, () => {
    console.log('listening on port', port);
});