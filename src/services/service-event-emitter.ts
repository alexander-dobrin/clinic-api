import { EventEmitter } from 'events';
import 'reflect-metadata';
import { injectable } from 'inversify';

@injectable()
export class ServiceEventEmitter {
    private readonly emitter: EventEmitter;

    public emit(event: string, ...args: any[]) {
        this.emitter.emit(event, ...args);
      }
      
      public on(event: string, listener: (...args: any[]) => void) {
        this.emitter.on(event, listener);
      }
}