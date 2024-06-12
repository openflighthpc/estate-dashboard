class CreateChangeRequests < ActiveRecord::Migration[7.1]
  def change
    create_table :change_requests do |t|
      t.references :resource, null: false
      t.string :platform
      t.string :resource_class
      t.integer :slot_capacity
      t.string :location
      t.boolean :burst

      t.timestamps
    end
  end
end
