require("dotenv").config();
const { MongoClient } = require("mongodb");

let db;

async function connectDB() {
	const client = new MongoClient(process.env.DB_URL, { useNewUrlParser: true });

	try {
		await client.connect();
		db = client.db();
		console.log("DB connected");
	} catch (error) {
		console.log(error);
	}
}

function getDB() {
	return db;
}

function getBookCollection() {
	return db.collection("books");
}

function getDeletedBookCollection() {
	return db.collection("deletedBooks");
}

module.exports = {
	getDB,
	connectDB,
	getBookCollection,
	getDeletedBookCollection,
};
