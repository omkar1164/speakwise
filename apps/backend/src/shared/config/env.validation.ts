import { plainToInstance } from 'class-transformer';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsEnum(['development', 'test', 'production'])
  NODE_ENV!: 'development' | 'test' | 'production';

  @IsNumber()
  @Min(1)
  @Transform(({ value }) =>
    typeof value === 'string' ? Number.parseInt(value, 10) : value,
  )
  PORT!: number;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  JWT_SECRET!: string;

  @IsOptional()
  @IsString()
  OPENAI_API_KEY?: string;

  @IsOptional()
  @IsString()
  ELEVENLABS_API_KEY?: string;

  @IsOptional()
  @IsUrl(
    {
      require_tld: false,
    },
    {
      message: 'CORS_ORIGIN must be a valid URL (localhost allowed)',
    },
  )
  CORS_ORIGIN?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${JSON.stringify(errors)}`);
  }

  return validatedConfig;
}
