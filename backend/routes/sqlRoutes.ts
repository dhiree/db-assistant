// routes/SqlRoutes.ts

import { Router, Request, Response } from 'express';
import SQLController from "../controller/sqlController";

 class SqlRoutes {
  public router: Router;
  private controller: SQLController;

  constructor() {
    this.router = Router();
    this.controller = new SQLController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/connect-sql', this.controller.connectDB);
    this.router.post('/query-sql', this.controller.handleQuery );
  }
}

export default  new SqlRoutes()
