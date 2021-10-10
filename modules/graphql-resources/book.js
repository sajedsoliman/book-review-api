const { UserInputError } = require("apollo-server-express");
const {
	getDB,
	getBookCollection,
	getDeletedBookCollection,
} = require("../mongo");
const { ObjectId } = require("mongodb");
const { authedUserResolver } = require("../../routes/auth");

function validateBook(book) {
	const errors = {};

	if (book.title.length < 8) {
		errors.title = "Title must be at least 8 letters";
	}
	if (!book.pagesCount) {
		errors.pagesCount = "Please provide the book pages count";
	}

	if (Object.keys(errors).length > 0)
		throw new UserInputError("Invalid input(s)", { errors });
}

async function bookList(_, { author, title, pagesMin, pagesMax }) {
	const filterVars = {};

	if (author) {
		filterVars.author = author;
	}
	if (title) {
		filterVars.title = title;
	}
	if (pagesMin || pagesMax) {
		// we define pagesCount object here because if don't it will be undefined, so we can't add ($gte or $lte) on it
		filterVars.pagesCount = {};

		if (pagesMin != undefined) {
			filterVars.pagesCount.$gte = pagesMin;
		}
		if (pagesMax != undefined) {
			filterVars.pagesCount.$lte = pagesMax;
		}
	}

	const booksCollection = getDB().collection("books");
	const books = await booksCollection.find(filterVars).toArray();

	return books;
}

async function deletedBookList(_) {
	const books = await getDeletedBookCollection().find().toArray();

	return books;
}

async function book(_, { id }) {
	const booksCollection = getDB().collection("books");
	const book = await booksCollection.findOne({ _id: ObjectId(id) });

	return book;
}

async function add(_, { book }) {
	validateBook(book);

	book.reviews = [];
	const dbBook = await getDB().collection("books").insertOne(book);

	return await getDB().collection("books").find().toArray();
}

async function update(_, { changes, id }) {
	if (changes.title != undefined || changes.pagesCount != undefined) {
		const book = await getBookCollection().findOne({ _id: ObjectId(id) });
		validateBook({ ...book, ...changes });
	}

	const dbBook = await getBookCollection().updateOne(
		{ _id: ObjectId(id) },
		{ $set: changes }
	);

	return await getBookCollection().find().toArray();
}

async function remove(_, { id }) {
	const book = await getBookCollection().findOne({ _id: ObjectId(id) });
	if (!book) return;

	book.deleted = new Date();

	// insert the book into (deletedBooks, or, trash) collection
	const hasDeleted = await getDeletedBookCollection().insertOne(book);

	if (hasDeleted.result.ok)
		await getBookCollection().deleteOne({ _id: ObjectId(id) });

	return await getBookCollection().find().toArray();
}

module.exports = {
	add: authedUserResolver(add),
	update: authedUserResolver(update),
	bookList,
	book,
	delete: authedUserResolver(remove),
	deletedBookList,
};
