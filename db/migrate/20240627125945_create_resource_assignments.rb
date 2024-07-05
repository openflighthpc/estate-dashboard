class CreateResourceAssignments < ActiveRecord::Migration[7.1]
  def change
    create_table :resource_assignments do |t|
      t.integer :no_slots
      t.boolean :burst, default: false
      t.boolean :pending, default: false
      t.references :resource, index: true, foreign_key: true
      t.references :resource_group, index: true, foreign_key: true
      t.references :assignment_change_request, index: true, foreign_key: true
      t.timestamps
    end
  end
end
