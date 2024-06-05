class CreateResources < ActiveRecord::Migration[7.1]
  def change
    create_table :resources do |t|
      t.references :organisations, null: false
      t.string :platform
      t.string :resource_class
      t.integer :slot_capacity
      t.float :cost
      t.string :location
      t.boolean :burst

      t.timestamps
    end
  end
end
