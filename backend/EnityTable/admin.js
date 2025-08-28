const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Admin',
  tableName: 'admin',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    admin_name: {
      type: 'varchar',
      length: 100,
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
    role: {
      type: 'varchar',
      length: 50,
      default: 'admin',
      nullable: false
    },
    department: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    phone: {
      type: 'varchar',
      length: 20,
      nullable: true
    },
    is_active: {
      type: 'boolean',
      default: true,
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
      name: 'IDX_ADMIN_EMAIL',
      columns: ['email']
    },
    {
      name: 'IDX_ADMIN_ROLE',
      columns: ['role']
    },
    {
      name: 'IDX_ADMIN_DEPARTMENT',
      columns: ['department']
    }
  ]
});
