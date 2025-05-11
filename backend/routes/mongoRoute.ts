// routes/MongoRoutes.ts

import { Router, Request, Response } from 'express';
import  MongoController  from '../controller/mongoController';

 class MongoRoutes {
  public router: Router;
  private controller: MongoController;

  constructor() {
    this.router = Router();
    this.controller = new MongoController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/connect-db',this.controller.connectDB );
    this.router.post('/query', this.controller.handleQuery );
  }
}

export default  new MongoRoutes()
