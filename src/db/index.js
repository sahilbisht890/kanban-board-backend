
const mongoose = require('mongoose');
const logger = require("../utils/logger");
const connectDB = async () => {
    try {

        // const connectionInstance = await mongoose.connect(`mongodb+srv://sahil_bisht:sahil890@cluster0.nbtnf.mongodb.net/`,{
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        //     serverSelectionTimeoutMS: 5000, // 5 seconds
        //     connectTimeoutMS: 30000,       // 10 seconds
        //   })

          const connection = await mongoose.connect(process.env.MONGODB_URI || '' , {
            connectTimeoutMS: 600000,
            serverSelectionTimeoutMS: 600000,
          });
        logger.info({ host: connection?.connection?.host }, "MongoDB connected");
    } catch (error) {
        logger.error({ err: error }, "MONGODB connection FAILED");
        process.exit(1)
    }
}

module.exports = connectDB
