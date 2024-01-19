import mongoose from 'mongoose';

// const { MONGODB_URI, MONGODB_DB } = process.env;
const MONGODB_URI =
  'mongodb+srv://jerin2001:Jerin2001@cluster0.bzglc9k.mongodb.net/?retryWrites=true&w=majority';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI and MONGODB_DB environment variables inside .env.local',
  );
}

async function connectToDatabase() {
  await mongoose.connect(MONGODB_URI);

  console.log('Connected to MongoDB');
}

export default connectToDatabase;
