import http from 'http';
import 'express-async-errors';

import { type Application } from 'express';
import { type Logger } from 'winston';
import { type Channel } from 'amqplib';
import { winstonLogger } from '@sunnatganiev/jobber-shared';
import { healthRoutes } from '@notifications/routes';
import { config } from '@notifications/config';
import { checkConnection } from '@notifications/elasticsearch';
import { createConnection } from '@notifications/queues/connection';
import { consumeAuthEmailMessages, consumeOrderEmailMessages } from '@notifications/queues/email.consumer';

const SERVER_PORT = 4001;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug');

export function start(app: Application): void {
  startServer(app);
  app.use('', healthRoutes);
  startQueues();
  startElasticSearch();
}

async function startQueues(): Promise<void> {
  const emailChannel = (await createConnection()) as Channel;
  await consumeAuthEmailMessages(emailChannel);
  await consumeOrderEmailMessages(emailChannel);
  // const verificationLink = `${config.CLIENT_URL}/config_email?v_token=213455afgafsda`;
  // const messageDetails: IEmailMessageDetails = {
  //   receiverEmail: `${config.SENDER_EMAIL}`,
  //   resetLink: verificationLink,
  //   username: 'Manny',
  //   template: 'forgotPassword'
  // };
  // await emailChannel.assertExchange('jobber-email-notification', 'direct');
  // emailChannel.publish('jobber-email-notification', 'auth-email', Buffer.from(JSON.stringify(messageDetails)));

  // await emailChannel.assertExchange('jobber-order-notification', 'direct');
  // emailChannel.publish(
  //   'jobber-order-notification',
  //   'order-email',
  //   Buffer.from(JSON.stringify({ name: 'jobber', service: 'order notification service' }))
  // );
}

function startElasticSearch(): void {
  checkConnection();
}

function startServer(app: Application): void {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`Worker with process id of #${process.pid} on notification server has started`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Notification server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', 'NotificationService startServer() method:', error);
  }
}
