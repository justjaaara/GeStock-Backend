import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'VW_USER_MANAGEMENT',
})
export class UserManagementView {
  @ViewColumn({ name: 'USER_ID' })
  userId: number;

  @ViewColumn({ name: 'NAME' })
  name: string;

  @ViewColumn({ name: 'EMAIL' })
  email: string;

  @ViewColumn({ name: 'ROLE_ID' })
  roleId: number;

  @ViewColumn({ name: 'ROLE_NAME' })
  roleName: string;

  @ViewColumn({ name: 'STATE_ID' })
  stateId: number;

  @ViewColumn({ name: 'STATE_NAME' })
  stateName: string;
}
