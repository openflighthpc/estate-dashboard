class CreateResourceGroups < ActiveRecord::Migration[7.1]
  def change
    create_table :resource_groups do |t|
      t.string :name
      t.string :description

      t.references :organisation, index: true, foreign_key: true

      t.timestamps
    end
  end
end
