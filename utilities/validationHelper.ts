import {
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';

type ExceptionType = { detail: string; table: string };

@Catch(QueryFailedError)
export class QueryErrorFilter extends BaseExceptionFilter<
  HttpException | ExceptionType
> {
  public catch(exception: ExceptionType, host: ArgumentsHost): void {
    const { detail = null } = exception || {};

    if (
      !detail ||
      typeof detail !== 'string' ||
      // deepcode ignore AttrAccessOnNull: <False positive>
      !detail.includes('already exists')
    ) {
      return super.catch(exception, host);
    } // else

    /**
     * this regex transform the message `(phone)=(123)` to a more intuitive `with phone: "123"` one,
     * the regex is long to prevent mistakes if the value itself is ()=(), for example, (phone)=(()=())
     */

    const extractMessageRegex =
      /\((.*?)(?:(?:\)=\()(?!.*(\))(?!.*\))=\()(.*?)\)(?!.*\)))(?!.*(?:\)=\()(?!.*\)=\()((.*?)\))(?!.*\)))/;

    const messageStart = `${exception.table.split('_').join(' ')} with`;

    /** prevent Regex DoS, doesn't treat messages longer than 200 characters */
    const exceptionDetail =
      exception.detail.length <= 200
        ? exception.detail.replace(extractMessageRegex, 'with $1: "$3"')
        : exception.detail;

    super.catch(
      new BadRequestException(exceptionDetail.replace('Key', messageStart)),
      host,
    );
  }
}
