import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service.js';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get total income, expense, and balance' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getDashboard(@Query('month') month?: string, @Query('year') year?: string) {
    return this.statisticsService.getDashboard(month ? Number(month) : undefined, year ? Number(year) : undefined);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get expense grouped by category' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getCategories(@Query('month') month?: string, @Query('year') year?: string) {
    return this.statisticsService.getCategories(month ? Number(month) : undefined, year ? Number(year) : undefined);
  }

  @Get('trend')
  @ApiOperation({ summary: 'Get financial trend' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  getTrend(@Query('year') year?: string, @Query('month') month?: string) {
    return this.statisticsService.getTrend(year ? Number(year) : undefined, month ? Number(month) : undefined);
  }
}
