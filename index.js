import express from "express";
import toobusy from "toobusy-js";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";
import { logger } from "./middlewares/logger.middleware.js";
import cookieParser from "cookie-parser";
import { connections } from "./controllers/session.controllers.js";
dotenv.config();

//Initialization
const app = express();

//Server load handler
app.use(function (req, res, next) {
	if (toobusy()) {
		// log if you see necessary
		res.status(503).json({ message: "Server Too Busy", data: null });
	} else {
		next();
	}
});

//Middlewares
app.use(
	cors({
		origin: [
			"http://localhost:3000/",
			"http://localhost:8000",
			"http://localhost:8080/",
		],
		credentials: true,
	})
);
app.use(logger);
app.use(express.json({ limit: "1kb" }));
app.use(express.urlencoded({ extended: false, limit: "1kb" }));
app.use(cookieParser());

//Routers
import homeRouter from "./routes/home.routes.js";
import sessionRouter from "./routes/session.routes.js";

//Parent routes
app.use("/api/", homeRouter);
app.use("/api/session", sessionRouter);

//Middlewares (Post routes)
app.use(errorHandler);

process.on("SIGINT", () => {
	console.log("Closing all connections");
	connections.forEach((ws, token) => {
		console.log("Closing connection " + token);
		ws.close();
	});
	console.log("Websocket connections closed, exiting...");
	process.exit();
});

const server = app.listen(process.env.PORT || 5000, () => {
	console.log(`Sandbox listening port ${process.env.PORT || 5000}`);
});
app.set("server", server);
