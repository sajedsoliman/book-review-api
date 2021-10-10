const { UserInputError } = require("apollo-server-express");
const { getBookCollection } = require("../mongo");
const { ObjectId } = require("mongodb");

function validate({ review }) {
	const errors = {};

	if (review === "") {
		errors.review = "review cannot be blank";
	}

	if (Object.keys(errors).length > 0) {
		throw new UserInputError("Invalid Input(s)", { errors });
	}
}

async function add(_, { review, bookId }) {
	validate(review);

	if (review.reviewer === "") {
		review.reviewer = "Guest";
	}

	const updatedBook = await getBookCollection().updateOne(
		{ _id: ObjectId(bookId) },
		{
			$push: {
				reviews: review,
			},
		}
	);

	const book = await getBookCollection().findOne({
		_id: ObjectId(bookId),
	});

	return book;
}

module.exports = { add };
