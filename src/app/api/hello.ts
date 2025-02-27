import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

/**
 * @route GET /api/hello
 * @desc Get data from this endpoint
 */
router.get("/", (req: Request, res: Response) => {
  res.json({ 
    message: "Route hello is working!",
    query: req.query
  });
});

/**
 * @route POST /api/hello
 * @desc Create new data
 */
router.post("/", (req: Request, res: Response) => {
  res.status(201).json({ 
    message: "Resource created successfully",
    body: req.body
  });
});

export default router;
