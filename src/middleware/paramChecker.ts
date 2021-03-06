import { Request, Response } from "express";
import { logger, DEBUG, ERROR, WARN } from "../logging";
import { validateEmail } from "../util";

// Check if the given object contains all the give params and that they're not empty
const hasAllParams = (obj: object, params: string[]) => {
  return params.every((item: string) => {
    return obj.hasOwnProperty(item) && obj[item];
  });
};

const checkUserParams = (req: Request) => {
  let goodRequest = true;
  let msg = "";

  if (req.path === "/user" && req.method === "POST") {
    if (!hasAllParams(req.body, ["username", "email"])) {
      goodRequest = false;
      msg = "Either username or email is missing";
      logger.log(ERROR, `User creation route missing either username or email`);
    } else {
      // Make sure the email provided is actually an email address
      const { email } = req.body;
      if (!validateEmail(email)) {
        goodRequest = false;
        msg = "Invalid email provided";
        logger.log(
          WARN,
          `Invalid email provided for creating a user: ${email}`
        );
      }
    }
  }

  return { goodRequest, msg };
};

// Verify that the various API routes have their appropriate parameters
export default (req: Request, res: Response, next: () => void) => {
  let checkResult = { goodRequest: true, msg: "" };
  if (req.path.startsWith("/user")) {
    checkResult = checkUserParams(req);
  }

  const { goodRequest, msg } = checkResult;

  if (goodRequest) {
    return next();
  } else {
    return res.status(400).send(msg);
  }
};
