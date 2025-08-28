const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Part',
  tableName: 'parts',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    sku: {
      type: 'varchar',
      length: 100,
      unique: true,
      nullable: false
    },
    name: {
      type: 'varchar',
      length: 200,
      nullable: false
    },
    description: {
      type: 'text',
      nullable: true
    },
    category: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    brand: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    model: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    on_hand_qty: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
      nullable: false
    },
    min_qty: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      default: 0,
      nullable: false
    },
    max_qty: {
      type: 'decimal',
      precision: 10,
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
    selling_price: {
      type: 'decimal',
      precision: 15,
      scale: 2,
      default: 0,
      nullable: false
    },
    moving_avg_cost: {
      type: 'decimal',
      precision: 15,
      scale: 2,
      default: 0,
      nullable: false
    },
    supplier_id: {
      type: 'uuid',
      nullable: true
    },
    location: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    is_active: {
      type: 'boolean',
      default: true,
      nullable: false
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
      name: 'IDX_PART_SKU',
      columns: ['sku']
    },
    {
      name: 'IDX_PART_NAME',
      columns: ['name']
    },
    {
      name: 'IDX_PART_CATEGORY',
      columns: ['category']
    },
    {
      name: 'IDX_PART_BRAND',
      columns: ['brand']
    },
    {
      name: 'IDX_PART_SUPPLIER',
      columns: ['supplier_id']
    },
    {
      name: 'IDX_PART_ACTIVE',
      columns: ['is_active']
    },
    {
      name: 'IDX_PART_STOCK',
      columns: ['on_hand_qty']
    }
  ]
});
