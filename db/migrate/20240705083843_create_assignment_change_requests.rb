class CreateAssignmentChangeRequests < ActiveRecord::Migration[7.1]
  def change
    create_table :assignment_change_requests do |t|
      t.string :status, default: 'PENDING'

      t.timestamps
    end
  end
end
