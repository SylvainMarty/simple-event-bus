import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { AppModule } from './app.module';

describe("AppModule", () => {
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    appService = app.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(appService).toBeDefined();
  });
});
