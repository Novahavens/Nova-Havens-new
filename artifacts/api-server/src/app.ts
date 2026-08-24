import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { TRUSTED_PROXY_HOPS } from "./routes/contact";

const app: Express = express();

// Requests arrive through the Replit edge proxy, so the socket address is
// always the proxy's. Trusting exactly that one hop — never `true` — is what
// lets per-sender throttling (see routes/contact.ts) key on the real visitor
// without letting a caller pick their own key via X-Forwarded-For.
app.set("trust proxy", TRUSTED_PROXY_HOPS);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
