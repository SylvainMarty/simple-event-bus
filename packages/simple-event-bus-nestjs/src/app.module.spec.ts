import { Test, TestingModule } from '@nestjs/testing';
import { AppSubscriber } from './app.subscriber';
import { AppService } from './app.service';
import { AppModule } from './app.module';
import { SimpleEventBusModule } from '@lib/simple-event-bus';

describe('Simple Event Bus NestJS Module', () => {
  // let appSubscriber: AppSubscriber;

  describe("AppModule", () => {
    let appService: AppService;

    beforeEach(async () => {
      const app: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      appService = app.get<AppService>(AppService);
    });

    it('test', () => {
      appService.triggerEvent()
    });
  });

  describe("SimpleEventBusModule", () => {
    let appService: AppService;

    beforeEach(async () => {
      const app: TestingModule = await Test.createTestingModule({
        imports: [SimpleEventBusModule],
        providers: [AppService, AppSubscriber],
      }).compile();

      appService = app.get<AppService>(AppService);
    });

    it('test', () => {
      appService.triggerEvent()
    });
  });

  describe("SimpleEventBusModule.forRoot()", () => {
    let appService: AppService;

    beforeEach(async () => {
      const app: TestingModule = await Test.createTestingModule({
        imports: [SimpleEventBusModule.forRoot()],
        providers: [AppService, AppSubscriber],
      }).compile();

      appService = app.get<AppService>(AppService);
    });

    it('test', () => {
      appService.triggerEvent()
    });
  });

  describe("SimpleEventBusModule.register()", () => {
    let appService: AppService;

    beforeEach(async () => {
      const app: TestingModule = await Test.createTestingModule({
        imports: [SimpleEventBusModule.register()],
        providers: [AppService, AppSubscriber],
      }).compile();

      appService = app.get<AppService>(AppService);
    });

    it('test', () => {
      appService.triggerEvent()
    });
  });
});
