import { Router, type IRouter } from "express";
import healthRouter from "./health";
import teamRouter from "./team";
import { createContactRouter } from "./contact";
import { dbContactStore } from "../lib/contactStore";
import { mondayContactNotifier } from "../lib/contactNotifier";

const router: IRouter = Router();

router.use(healthRouter);
router.use(teamRouter);
router.use(createContactRouter(dbContactStore, mondayContactNotifier));

export default router;
