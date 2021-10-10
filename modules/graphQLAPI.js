require("dotenv").config();

const fs = require("fs");
const {
	ApolloServer,
	UserInputError,
	AuthenticationError,
} = require("apollo-server-express");
const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");
const book = require("./graphql-resources/book");
const review = require("./graphql-resources/review");
const auth = require("../routes/auth");

// custom scalar types
const DateType = new GraphQLScalarType({
	name: "DateType",
	description: "A Date() type in GraphQL as a scalar",
	serialize(value) {
		return value.toISOString();
	},
	parseLiteral(ast) {
		if (ast.kind === Kind.STRING) {
			const date = new Date(ast.value);
			return isNaN(date) ? undefined : date;
		}
	},
	parseValue(value) {
		const date = new Date(value);

		if (isNaN(date)) {
			throw new UserInputError("invalid date", {
				errors: {
					date: "Date is invalid",
				},
			});
		} else return date;
	},
});

// resolvers' handlers
const resolvers = {
	Query: {
		bookList: book.bookList,
		deletedBookList: book.deletedBookList,
		book: book.book,
	},
	Mutation: {
		bookAdd: book.add,
		bookUpdate: book.update,
		bookDelete: book.delete,
		reviewAdd: review.add,
	},
	DateType,
};

// const schemaFile = fs.readFileSync("schema.graphql", "utf-8");

const server = new ApolloServer({
	typeDefs: fs.readFileSync("./modules/schema.graphql", "utf-8"),
	resolvers,
	context: getContext,
});

function getContext({ req }) {
	const user = auth.getUser(req);

	// if (!user.signedIn) throw new AuthenticationError("you must be logged in");
	return { user };
}

function initApollo(app) {
	const enableCORS = (process.env.ENABLE_CORS || "true") == "true";
	server.applyMiddleware({ app, path: "/graphql", cors: enableCORS });
}

module.exports = initApollo;
