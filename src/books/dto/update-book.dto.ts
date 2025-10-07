import {
  IsString,
  IsNumber,
  IsPositive,
  MinLength,
  IsOptional,
} from 'class-validator';

export class UpdateBookDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  title?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  author?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;
}
