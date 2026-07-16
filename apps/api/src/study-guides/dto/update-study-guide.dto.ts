import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

function trimOptionalTitle(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

export class UpdateStudyGuideDto {
  @Transform(({ value }) => trimOptionalTitle(value))
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200_000)
  contentMarkdown?: string;
}
