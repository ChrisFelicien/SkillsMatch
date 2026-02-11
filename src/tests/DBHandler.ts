import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongodb: MongoMemoryServer;

export const connect = async () => {
  mongodb = await MongoMemoryServer.create(); // create mongo instance
  const uri = mongodb.getUri();

  //   connect to database
  await mongoose.connect(uri);
};

// clear data between test
export const clearData = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];

    await collection?.deleteMany({});
  }
};

export const closeDbConnection = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongodb.stop();
};
