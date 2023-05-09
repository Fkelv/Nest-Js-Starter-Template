import { TableColumn, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'user_profile_view',
  expression: `
    SELECT
      user.id AS userId,
      reputation.name AS reputation,
      SUM(task.points) AS totalPoints,
      SUM(task.cash) AS totalCash,
      JSON_ARRAYAGG(task.title) AS taskTitles
    FROM user
    LEFT JOIN reward ON reward.userId = user.id
    LEFT JOIN task ON task.id = reward.taskId
    LEFT JOIN reputation ON reputation.id = user.reputationId
    GROUP BY user.id
  `,
})
export class UserProfileView {
  @ViewColumn(new TableColumn({ name: 'userId', type: 'int' }))
  userId: number;

  @ViewColumn(new TableColumn({ name: 'reputation', type: 'varchar' }))
  reputation: string;

  @ViewColumn(new TableColumn({ name: 'totalPoints', type: 'int' }))
  totalPoints: number;

  @ViewColumn(
    new TableColumn({
      name: 'totalCash',
      type: 'decimal',
      precision: 10,
      scale: 2,
    }),
  )
  totalCash: number;

  @ViewColumn(new TableColumn({ name: 'taskTitles', type: 'json' }))
  taskTitles: string[];
}
