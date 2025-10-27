import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'VW_CLOSURE_HEADER',
})
export class ClosureHeaderView {
  @ViewColumn({ name: 'HEADER_ID' })
  headerId: number;

  @ViewColumn({ name: 'CLOSURE_DATE' })
  closureDate: Date;

  @ViewColumn({ name: 'CLOSURE_MONTH' })
  closureMonth: number;

  @ViewColumn({ name: 'CLOSURE_YEAR' })
  closureYear: number;

  @ViewColumn({ name: 'USER_NAME' })
  userName: string;

  @ViewColumn({ name: 'STATUS' })
  status: string;
}
