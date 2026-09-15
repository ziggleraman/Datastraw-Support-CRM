require("dotenv").config();

const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}

const client = new MongoClient(uri);

let db;
let tickets;
let notes;

async function connectDB() {
  await client.connect();

  db = client.db("support_crm");
  tickets = db.collection("tickets");
  notes = db.collection("notes");

  await tickets.createIndex({ ticket_id: 1 }, { unique: true });

  console.log("Connected to MongoDB");
}

function getTicketsCollection() {
  if (!tickets) {
    throw new Error("Database is not connected");
  }

  return tickets;
}

function getNotesCollection() {
  if (!notes) {
    throw new Error("Database is not connected");
  }

  return notes;
}

module.exports = {
  connectDB,
  getTicketsCollection,
  getNotesCollection
};