import { Request, Response, Router } from "express";

import {
  createUser,
  deleteUser,
  getUser,
  login
} from "../controllers/userController";

import { authenticateUser } from "../middleware/authentication";

const router: Router = Router();

// Middleware
router.use(authenticateUser);

// Login a user
router.get("/login", async (req: Request, res: Response) => {
  const { email, password } = req.query;

  const { status, data } = await login(email, password);

  return res.status(status).json(data);
});

// Get user by ID
router.get("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = await getUser(userId);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
  }
});

// Create user
router.post("/", async (req: Request, res: Response) => {
  const { username, email } = req.body;
  const { successfullyCreatedUser, generatedPassword } = await createUser(
    username,
    email
  );

  if (successfullyCreatedUser) {
    return res.status(200).json({ success: true, generatedPassword });
  } else {
    return res.status(500).json({ success: false });
  }
});

// Delete a user
router.delete("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;

  const deleteWasSuccessful = await deleteUser(userId);

  if (deleteWasSuccessful) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(404).json({ success: false, msg: "Could not find user" });
  }
});

// Simple route to verify if the user's provided API key/token is valid
router.get("/verify-auth", (req: Request, res: Response) => {
  return res.sendStatus(200);
});

export const userRouter: Router = router;
