
const mongoose = require('mongoose');
const connectDB = async () => {
    try {

        // const connectionInstance = await mongoose.connect(`mongodb+srv://sahil_bisht:sahil890@cluster0.nbtnf.mongodb.net/`,{
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        //     serverSelectionTimeoutMS: 5000, // 5 seconds
        //     connectTimeoutMS: 30000,       // 10 seconds
        //   })

        console.log('process.env.MONGODB_URI',process.env.MONGODB_URI );
          const connection = await mongoose.connect(process.env.MONGODB_URI || '' , {
            connectTimeoutMS: 600000,
            serverSelectionTimeoutMS: 600000,
          });
        console.log(`MongoDB connected`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

module.exports = connectDB