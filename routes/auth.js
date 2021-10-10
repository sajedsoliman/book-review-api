const Router = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server-express");

const routes = new Router();
routes.use(Router.json());

let { JWT_SECRET } = process.env;

routes.post("/signin", async (req, res) => {
	if (!JWT_SECRET) {
		res.status(500).send("Missing JWT_SECRET. Authentication is disabled");
	}

	let payload;

	const token = req.body.google_token;
	if (token) {
		const client = new OAuth2Client();

		try {
			const ticket = await client.verifyIdToken({ idToken: token });
			payload = ticket.getPayload();
		} catch (error) {
			res.status(403).send("Invalid Credentials");
		}
		// res.status(400).send({ code: 400, message: "Missing Token" });
	} else return;

	const { name, email } = payload;
	const credentials = {
		name,
		email,
		signedIn: true,
	};
	const jwt_token = jwt.sign(credentials, JWT_SECRET);
	res.cookie("jwt", jwt_token, { httpOnly: true });
	res.json(credentials);
});

routes.post("/signout", (req, res) => {
	res.clearCookie("jwt");
	res.json({ status: "ok" });
});

routes.post("/user", (req, res) => {
	res.json(getUser(req));
});

function getUser(req) {
	const token = req.cookies.jwt;
	if (!token) return { signedIn: false };

	try {
		const credentials = jwt.verify(token, JWT_SECRET);
		return credentials;
	} catch (error) {
		return { signedIn: false };
	}
}

function authedUserResolver(resolver) {
	return (root, args, { user }) => {
		if (!user || !user.signedIn) {
			throw new AuthenticationError("You must be signed in");
		}

		return resolver(root, args, { user });
	};
}

module.exports = { routes, getUser, authedUserResolver };
