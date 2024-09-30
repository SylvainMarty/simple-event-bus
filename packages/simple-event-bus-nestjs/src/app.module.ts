import { SimpleEventBusModule } from "@lib/simple-event-bus";
import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { AppSubscriber } from "./app.subscriber";

@Module({
  imports: [SimpleEventBusModule.forRoot()],
  providers: [AppService, AppSubscriber],
})
export class AppModule {}
