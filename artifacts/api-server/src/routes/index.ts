import { Router, type IRouter } from "express";
import healthRouter from "./health";
import teamRouter from "./team";
import { createContactRouter } from "./contact";
import { dbContactStore } from "../lib/contactStore";

const router: IRouter = Router();

router.use(healthRouter);
router.use(teamRouter);
router.use(createContactRouter(dbContactStore));

export default router;
