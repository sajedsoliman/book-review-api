require("dotenv").config();

// imports
const express = require("express");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./modules/mongo");
const initApollo = require("./modules/graphQLAPI");
var cors = require("cors");

const auth = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/auth", auth.routes);

const PORT = process.env.PORT || 5000;

initApollo(app);

(async function startServer() {
	try {
		await connectDB();

		app.listen(5000, () => console.log(`http://localhost:${PORT}/graphql`));
	} catch (error) {
		console.log(error);
	}
})();
