import { Router } from "express";

export interface IRoutes {
    get router(): Router;
}