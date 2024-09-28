import { Module } from '@nestjs/common';
import { AppSubscriber } from './app.subscriber';
import { AppService } from './app.service';
import { SimpleEventBusModule } from '@lib/simple-event-bus';

@Module({
  imports: [SimpleEventBusModule.forRoot()],
  providers: [AppService, AppSubscriber],
})
export class AppModule { }
