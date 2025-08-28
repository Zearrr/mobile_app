const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Job',
  tableName: 'jobs',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    job_number: {
      type: 'varchar',
      length: 50,
      unique: true,
      nullable: false
    },
    customer_id: {
      type: 'uuid',
      nullable: false
    },
    device_type: {
      type: 'varchar',
      length: 100,
      nullable: false
    },
    device_brand: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    device_model: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    serial_number: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    problem_description: {
      type: 'text',
      nullable: false
    },
    diagnosis: {
      type: 'text',
      nullable: true
    },
    solution: {
      type: 'text',
      nullable: true
    },
    status: {
      type: 'varchar',
      length: 50,
      default: 'open',
      nullable: false
    },
    priority: {
      type: 'varchar',
      length: 20,
      default: 'normal',
      nullable: false
    },
    estimated_cost: {
      type: 'decimal',
      precision: 15,
      scale: 2,
      default: 0,
      nullable: false
    },
    actual_cost: {
      type: 'decimal',
      precision: 15,
      scale: 2,
      default: 0,
      nullable: false
    },
    labor_cost: {
      type: 'decimal',
      precision: 15,
      scale: 2,
      default: 0,
      nullable: false
    },
    parts_cost: {
      type: 'decimal',
      precision: 15,
      scale: 2,
      default: 0,
      nullable: false
    },
    assigned_technician: {
      type: 'uuid',
      nullable: true
    },
    created_by: {
      type: 'uuid',
      nullable: false
    },
    started_at: {
      type: 'timestamp',
      nullable: true
    },
    completed_at: {
      type: 'timestamp',
      nullable: true
    },
    warranty_days: {
      type: 'integer',
      default: 0,
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
      name: 'IDX_JOB_NUMBER',
      columns: ['job_number']
    },
    {
      name: 'IDX_JOB_CUSTOMER',
      columns: ['customer_id']
    },
    {
      name: 'IDX_JOB_STATUS',
      columns: ['status']
    },
    {
      name: 'IDX_JOB_PRIORITY',
      columns: ['priority']
    },
    {
      name: 'IDX_JOB_TECHNICIAN',
      columns: ['assigned_technician']
    },
    {
      name: 'IDX_JOB_CREATED_BY',
      columns: ['created_by']
    },
    {
      name: 'IDX_JOB_CREATED_AT',
      columns: ['created_at']
    }
  ]
});
