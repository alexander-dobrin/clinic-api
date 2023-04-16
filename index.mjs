import dotenv from 'dotenv';
import { Server } from './src/app/server.mjs';

const server = new Server().getServer();

dotenv.config()

server.listen(process.env.PORT);