class ResourceAssignment < ApplicationRecord
  belongs_to :resource_group
  belongs_to :resource
  belongs_to :assignment_change_request, optional: true
end
