import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsDateString, IsPositive } from 'class-validator';
import { CategoryType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ example: 'b0e9c9c3-...' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.EXPENSE })
  @IsEnum(CategoryType)
  @IsNotEmpty()
  type: CategoryType;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ example: 'Makan siang' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-10-05T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  transactionDate: string;
}
