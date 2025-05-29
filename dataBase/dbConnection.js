import mongoose from "mongoose";

const dbConnection = () => {
    mongoose.connect(process.env.MONGO_URI, {   
        dbName: "ISRAR-LZYCRAZY"  
    }).then(()=>{ 
        console.log("Connected to MongoDB dataBase Successfully...");
    }).catch((error) => {
        console.error("Failed to connect to MongoDB dataBase", error);
    })
};

export default dbConnection;