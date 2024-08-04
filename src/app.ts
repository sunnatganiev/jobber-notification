import express, { type Application } from 'express';
import { winstonLogger } from '@sunnatganiev/jobber-shared';
import { type Logger } from 'winston';
import { config } from '@notifications/config';
import { start } from '@notifications/server';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationApp', 'debug');

function initialize(): void {
  const app: Application = express();
  start(app);
  log.info('Notification Service Initialized');
}

initialize();
