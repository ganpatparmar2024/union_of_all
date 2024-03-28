import express from "express";
import { renderResult } from "../controllers/resultController.js";
import { renderReport } from "../controllers/reportController.js";

const paginationMiddleware = (pageSize) => {
    return (req, res, next) => {
      const pageNumber = parseInt(req.query.page) || 1; // Get the current page number from the query parameters
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
  
      // Attach pagination data to the request object
      req.pagination = {
        page: pageNumber,
        limit: pageSize,
        startIndex,
        endIndex
      };
  
      next(); // Call the next middleware
    };
  };

  const router=express.Router();

  router.get("/", paginationMiddleware(10),renderResult);
  router.get("/report",renderReport)
  export{router}
