const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'JobPart',
  tableName: 'job_parts',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    job_id: {
      type: 'uuid',
      nullable: false
    },
    part_id: {
      type: 'uuid',
      nullable: false
    },
    qty: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 1,
      nullable: false
    },
    unit_price: {
      type: 'decimal',
      precision: 15,
      scale: 2,
      default: 0,
      nullable: false
    },
    unit_cost: {
      type: 'decimal',
      precision: 15,
      scale: 2,
      default: 0,
      nullable: false
    },
    warranty_days: {
      type: 'integer',
      default: 0,
      nullable: false
    },
    note: {
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
    { name: 'IDX_JOB_PART_JOB', columns: ['job_id'] },
    { name: 'IDX_JOB_PART_PART', columns: ['part_id'] }
  ]
});


