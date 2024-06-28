const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connection successful"))
    .catch((error) => console.log(error));

const instance = new Razorpay({
    key_id: process.env.KEY,
    key_secret: process.env.SECRET,
});

const paymentSchema = new mongoose.Schema({
    razorpay_order_id: {
        type: String,
        required: true,
    },
    razorpay_payment_id: {
        type: String,
        required: true,
    },
    razorpay_signature: {
        type: String,
        required: true,
    },
});

const Payment = mongoose.model("Payment", paymentSchema);

// Checkout API
app.post("/checkout", async (req, res) => {
    try {
        const options = {
            amount: Number(req.body.amount * 100),
            currency: "INR",
        };
        const order = await instance.orders.create(options);
        console.log(order);
        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

// Payment verification
app.post("/paymentverification", async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuth = expectedSignature === razorpay_signature;
        if (isAuth) {
            await Payment.create({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            });
            res.redirect(`http://localhost:5173/paymentsuccess?reference=${razorpay_payment_id}`);
        } else {
            res.status(400).json({ success: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

// Razorpay key route
app.get("/api/getkey", (req, res) => {
    res.status(200).json({ key: process.env.KEY });
});

// Subscription creation
app.post("/subscribe", async (req, res) => {
    try {
        const { plan_id } = req.body;
        const subscription = await instance.subscriptions.create({
            plan_id,
            total_count: 365, // Total number of billing cycles (1 year)
            quantity: 1,
        });
        res.status(200).json({ subscription });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

app.listen(8000, () => {
    console.log(`Server listening on port 8000`);
});
