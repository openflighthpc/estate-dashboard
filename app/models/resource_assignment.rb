class ResourceAssignment < ApplicationRecord
  belongs_to :resource_group
  belongs_to :resource
end
