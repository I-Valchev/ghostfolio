import { baseCurrency, benchmarks } from '@ghostfolio/common/config';
import { DATE_FORMAT } from '@ghostfolio/common/helper';
import { isApiTokenAuthorized } from '@ghostfolio/common/permissions';
import { RequestWithUser } from '@ghostfolio/common/types';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Inject,
  Param,
  Post
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { parse } from 'date-fns';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

import { CreateOrderDto } from './create-order.dto';
import { ExperimentalService } from './experimental.service';
import { Data } from './interfaces/data.interface';

@Controller('experimental')
export class ExperimentalController {
  public constructor(
    private readonly experimentalService: ExperimentalService,
    @Inject(REQUEST) private readonly request: RequestWithUser
  ) {}

  @Get('benchmarks')
  public async getBenchmarks(
    @Headers('Authorization') apiToken: string
  ): Promise<string[]> {
    if (!isApiTokenAuthorized(apiToken)) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.FORBIDDEN),
        StatusCodes.FORBIDDEN
      );
    }

    return benchmarks.map(({ symbol }) => {
      return symbol;
    });
  }

  @Get('benchmarks/:symbol')
  public async getBenchmark(
    @Headers('Authorization') apiToken: string,
    @Param('symbol') symbol: string
  ): Promise<{ date: Date; marketPrice: number }[]> {
    if (!isApiTokenAuthorized(apiToken)) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.FORBIDDEN),
        StatusCodes.FORBIDDEN
      );
    }

    const marketData = await this.experimentalService.getBenchmark(symbol);

    if (marketData?.length === 0) {
      throw new HttpException(
        getReasonPhrase(StatusCodes.NOT_FOUND),
        StatusCodes.NOT_FOUND
      );
    }

    return marketData;
  }
}
