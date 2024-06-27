class CreateResourceAssignments < ActiveRecord::Migration[7.1]
  def change
    create_table :resource_assignments do |t|
      t.integer :no_slots
      t.references :resource, index: true, foreign_key: true
      t.references :resource_group, index: true, foreign_key: true
      t.timestamps
    end
  end
end
