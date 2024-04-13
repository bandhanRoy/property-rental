import { Logger } from '@nestjs/common';
import * as morgan from 'morgan';

export const requestLogger = morgan('combined', {
  stream: { write: (message: string) => Logger.log(message.trim()) },
});
