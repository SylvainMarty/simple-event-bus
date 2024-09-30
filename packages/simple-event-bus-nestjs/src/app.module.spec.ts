import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "./app.module";
import { AppService } from "./app.service";

describe("AppModule", () => {
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    appService = app.get<AppService>(AppService);
  });

  it("should be defined", () => {
    expect(appService).toBeDefined();
  });
});
