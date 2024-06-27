class ResourceGroup < ApplicationRecord
  belongs_to :organisation
  has_many :resource_assignments
end
