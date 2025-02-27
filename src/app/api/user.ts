import type { Request, Response } from "express";

/**
 * @route GET /api/user
 * @desc Get data from this endpoint
 */
export function GET(_req: Request, res: Response) {
  return res.json({ msg: "Hello from /user: GET" });
}

/**
 * @route POST /api/user
 * @desc Create new data
 */
export function POST(req: Request, res: Response) {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ msg: "Missing name or email" });
  }

  return res.json({ msg: "Hello from /user: POST" });
}
