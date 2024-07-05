class ResourceGroup < ApplicationRecord
  belongs_to :organisation
  has_many :resource_assignments, dependent: :destroy
  has_many :pending_resource_assignments, dependent: :destroy
end
