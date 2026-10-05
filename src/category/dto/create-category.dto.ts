import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { CategoryType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Food & Beverage' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.EXPENSE })
  @IsEnum(CategoryType)
  @IsNotEmpty()
  type: CategoryType;

  @ApiPropertyOptional({ example: '🍔' })
  @IsString()
  @IsOptional()
  icon?: string;
}
