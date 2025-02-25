import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Hello from After App!" });
});

export default router;
