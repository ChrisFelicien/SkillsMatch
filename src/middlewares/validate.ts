import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

const validateSchema = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query
      });

      return next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateSchema;
