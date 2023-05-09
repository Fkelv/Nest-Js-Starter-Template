import { IsArray } from 'class-validator';
import { PageMetaDto } from './page-meta.dto';

export class PageDto<T> {
  @IsArray()
  readonly data: T[];

  readonly meta: PageMetaDto;
  readonly count: number;
  readonly next: string;
  readonly previous: string;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.count = meta.count;
    this.next = meta.next;
    this.previous = meta.previous;
  }
}
