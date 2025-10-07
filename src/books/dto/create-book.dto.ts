import { IsString, IsNumber, IsPositive, MinLength } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  author: string;

  @IsNumber()
  @IsPositive()
  price: number;
}
