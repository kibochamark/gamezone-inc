"use server"
import { MongoClient } from "mongodb";



export async function connectToCluster(uri="mongodb+srv://thesirfire:D95lUHfKygx9819S@dantech.w9lwt.mongodb.net/dantech?retryWrites=true&w=majority&appName=Dantech") {
   let mongoClient;

   try {
       mongoClient = new MongoClient(uri);
       console.log('Connecting to MongoDB Atlas cluster...');
       await mongoClient.connect();
       console.log('Successfully connected to MongoDB Atlas!');

       return mongoClient;
   } catch (error) {
       console.error('Connection to MongoDB Atlas failed!', error);
       process.exit();
   }
}