class CreateOrganisation < ActiveRecord::Migration[7.1]
  def change
    create_table :organisation do |t|
      t.string :name
      t.string :channel_name
      t.string :channel_id

      t.timestamps
    end
  end
end
