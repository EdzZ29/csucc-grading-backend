"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const cookieParser = require("cookie-parser");
const forbidden_exception_filter_1 = require("./filter/forbidden-exception.filter");
const bodyParser = require("body-parser");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        exceptionFactory: (errors) => {
            const messages = errors.map((err) => Object.values(err.constraints)[0]);
            return new common_1.BadRequestException(messages[0]);
        },
    }));
    app.use(cookieParser());
    app.useGlobalFilters(new forbidden_exception_filter_1.AllExceptionsFilter());
    app.enableCors({
        origin: ['http://localhost:7000'],
        credentials: true,
    });
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    await app.listen(9000);
}
bootstrap();
//# sourceMappingURL=main.js.map