import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'https://b5bcc68988b8425e8d9fde66f75811ae@o4504248033476608.ingest.sentry.io/4504248034656256',

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
