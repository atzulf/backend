import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { CategoryType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryTransactionDto {
  @ApiPropertyOptional({ enum: CategoryType })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: '2026-10-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-10-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
