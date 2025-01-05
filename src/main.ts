import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import type { AllConfigType } from './config/config.type';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import validationOptions from './utils/validation-options';
import { ResolvePromisesInterceptor } from './utils/serializer.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Create the application instance using the AppModule
  const app = await NestFactory.create(AppModule, { cors: true });

  // Enable class-validator to resolve dependencies from the Nest.js container
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Retrieve the configuration service instance with type inference
  const configService = app.get(ConfigService<AllConfigType>);

  // Enable hooks to gracefully handle application shutdown (e.g., releasing resources)
  app.enableShutdownHooks();

  // Set a global API prefix, retrieved from the config, for all routes except the root ('/')
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );

  // Enable API versioning using URI versioning (e.g., `/v1/resource`)
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Apply global pipes for validation with custom options
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  // Add global interceptors
  app.useGlobalInterceptors(
    // ResolvePromisesInterceptor handles promise resolution in responses
    // This workaround is needed because class-transformer does not support promise resolution directly
    // Reference: https://github.com/typestack/class-transformer/issues/549
    new ResolvePromisesInterceptor(),
    // ClassSerializerInterceptor transforms response objects according to class-transformer decorators
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // Set up Swagger for API documentation
  const options = new DocumentBuilder()
    .setTitle('API') // Title of the API documentation
    .setDescription('API docs') // Description of the API
    .setVersion('1.0') // Version of the API
    .addBearerAuth() // Add Bearer Token Authentication
    .build();

  // Create the Swagger document and configure the Swagger UI at the `/docs` endpoint
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  // Start the application, listening on the port specified in the configuration
  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}

// Run the bootstrap function to start the application
bootstrap();
