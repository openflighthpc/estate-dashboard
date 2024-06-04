class CreateResource < ActiveRecord::Migration[7.1]
  def change
    create_table :resources do |t|
      t.references :organisation, null: false
      t.string :platform
      t.string :resource_class
      t.integer :slot_capacity
      t.float :cost
      t.boolean :burst

      t.timestamps
    end
  end
end
