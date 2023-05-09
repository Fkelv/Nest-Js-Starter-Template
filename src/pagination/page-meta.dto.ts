import { PageMetaDtoParameters } from './interfaces';

export class PageMetaDto {
  readonly page: number;

  readonly skip: number;

  readonly take: number;

  readonly count: number;

  readonly pageCount: number;

  readonly previous: string;

  readonly next: string;

  constructor({ pageOptionsDto, itemCount, pageRoute }: PageMetaDtoParameters) {
    this.page =
      pageOptionsDto.skip === 0
        ? 1
        : Math.ceil(pageOptionsDto.skip / pageOptionsDto.take) + 1;
    this.skip = pageOptionsDto.skip === null ? 1 : pageOptionsDto.skip;
    this.take = pageOptionsDto.take;
    this.count = itemCount;
    this.pageCount = Math.ceil(this.count / this.take);
    this.previous =
      this.page > 1
        ? `${pageRoute}skip=${
            pageOptionsDto.skip - pageOptionsDto.take > 0
              ? pageOptionsDto.skip - pageOptionsDto.take
              : 0
          }&take=${pageOptionsDto.take}`
        : null;
    this.next =
      this.page < this.pageCount
        ? `${pageRoute}skip=${
            Number(pageOptionsDto.skip) + Number(pageOptionsDto.take)
          }&take=${pageOptionsDto.take}`
        : null;
  }
}
