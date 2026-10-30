import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferDto {
  @ApiProperty({ example: 'source-cat-id' })
  @IsString()
  @IsNotEmpty()
  sourceCategoryId: string;

  @ApiProperty({ example: 'target-cat-id' })
  @IsString()
  @IsNotEmpty()
  targetCategoryId: string;

  @ApiProperty({ example: 'Tabungan' })
  @IsString()
  @IsNotEmpty()
  sourceCategoryName: string;

  @ApiProperty({ example: 'Makan' })
  @IsString()
  @IsNotEmpty()
  targetCategoryName: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ example: 'Pindah alokasi' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-10-29T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  transactionDate: string;
}
