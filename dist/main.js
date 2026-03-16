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
    const allowedOrigins = process.env.FRONTEND_URL
        ? [process.env.FRONTEND_URL, 'http://localhost:7000']
        : ['http://localhost:7000'];
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
    });
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    const port = process.env.PORT || 9000;
    await app.listen(port);
    console.log(`Backend running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map