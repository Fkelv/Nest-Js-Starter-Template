import { PrimaryColumn, TableColumn, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'user_view',
  expression: `
    SELECT
      user.id AS id,
      user.firstName AS firstName,
      user.secondName AS secondName,
      user.username AS username,
      user.email AS email,
      user.isActive AS isActive,
      user.isEmailVerified AS isEmailVerified,
      reputation.name AS reputationName,
      user.createdAt AS createdAt,
      user.updatedAt AS updatedAt
    FROM user
    LEFT JOIN reputation ON reputation.id = user.reputationId
  `,
})
export class UserView {
  @PrimaryColumn()
  id: number;

  @ViewColumn(new TableColumn({ name: 'firstName', type: 'varchar' }))
  firstName: string;

  @ViewColumn(new TableColumn({ name: 'secondName', type: 'varchar' }))
  secondName: string;

  @ViewColumn(new TableColumn({ name: 'username', type: 'varchar' }))
  username: string;

  @ViewColumn(new TableColumn({ name: 'email', type: 'varchar' }))
  email: string;

  @ViewColumn(new TableColumn({ name: 'isActive', type: 'boolean' }))
  isActive: boolean;

  @ViewColumn(new TableColumn({ name: 'isEmailVerified', type: 'boolean' }))
  isEmailVerified: boolean;

  @ViewColumn(new TableColumn({ name: 'reputationName', type: 'varchar' }))
  reputationName: string;

  @ViewColumn(new TableColumn({ name: 'createdAt', type: 'datetime' }))
  createdAt: Date;

  @ViewColumn(new TableColumn({ name: 'updatedAt', type: 'datetime' }))
  updatedAt: Date;
}
