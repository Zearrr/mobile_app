const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    username: {
      type: 'varchar',
      length: 50,
      unique: true,
      nullable: false
    },
    email: {
      type: 'varchar',
      length: 255,
      unique: true,
      nullable: false
    },
    password: {
      type: 'varchar',
      length: 255,
      nullable: false
    },
    first_name: {
      type: 'varchar',
      length: 100,
      nullable: false
    },
    last_name: {
      type: 'varchar',
      length: 100,
      nullable: false
    },
    phone: {
      type: 'varchar',
      length: 20,
      nullable: true
    },
    role: {
      type: 'varchar',
      length: 50,
      default: 'user',
      nullable: false
    },
    department: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    position: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    is_active: {
      type: 'boolean',
      default: true,
      nullable: false
    },
    email_verified: {
      type: 'boolean',
      default: false,
      nullable: false
    },
    last_login: {
      type: 'timestamp',
      nullable: true
    },
    created_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      nullable: false
    },
    updated_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      onUpdate: 'CURRENT_TIMESTAMP',
      nullable: false
    }
  },
  indices: [
    {
      name: 'IDX_USER_EMAIL',
      columns: ['email']
    },
    {
      name: 'IDX_USER_USERNAME',
      columns: ['username']
    },
    {
      name: 'IDX_USER_ROLE',
      columns: ['role']
    },
    {
      name: 'IDX_USER_DEPARTMENT',
      columns: ['department']
    },
    {
      name: 'IDX_USER_ACTIVE',
      columns: ['is_active']
    }
  ]
});
