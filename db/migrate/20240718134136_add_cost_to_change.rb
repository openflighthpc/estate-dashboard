class AddCostToChange < ActiveRecord::Migration[7.1]
  def change
    add_column :changes, :cost, :float
  end
end
