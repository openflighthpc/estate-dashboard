class ResourceAssignment < ApplicationRecord
  belongs_to :resource_group
  belongs_to :resource
  belongs_to :assignment_change_request, optional: true

  validates :resource_group_id, uniqueness: { scope: [:resource, :burst, :pending], 
                                message: "an entry exists with this combo of resource_group_id, resource, burst and pending" }
end
