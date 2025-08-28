const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Customer',
  tableName: 'customers',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    name: {
      type: 'varchar',
      length: 200,
      nullable: false
    },
    phone: {
      type: 'varchar',
      length: 20,
      nullable: true
    },
    email: {
      type: 'varchar',
      length: 255,
      nullable: true
    },
    address: {
      type: 'text',
      nullable: true
    },
    city: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    postal_code: {
      type: 'varchar',
      length: 10,
      nullable: true
    },
    customer_type: {
      type: 'varchar',
      length: 50,
      default: 'individual',
      nullable: false
    },
    tax_id: {
      type: 'varchar',
      length: 20,
      nullable: true
    },
    credit_limit: {
      type: 'decimal',
      precision: 15,
      scale: 2,
      default: 0,
      nullable: false
    },
    is_active: {
      type: 'boolean',
      default: true,
      nullable: false
    },
    notes: {
      type: 'text',
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
      name: 'IDX_CUSTOMER_NAME',
      columns: ['name']
    },
    {
      name: 'IDX_CUSTOMER_PHONE',
      columns: ['phone']
    },
    {
      name: 'IDX_CUSTOMER_EMAIL',
      columns: ['email']
    },
    {
      name: 'IDX_CUSTOMER_TYPE',
      columns: ['customer_type']
    },
    {
      name: 'IDX_CUSTOMER_ACTIVE',
      columns: ['is_active']
    }
  ]
});
