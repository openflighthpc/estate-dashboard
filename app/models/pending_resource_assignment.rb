class PendingResourceAssignment < ApplicationRecord
  belongs_to :assignment_change_request
  belongs_to :resource_group
  belongs_to :resource

  delegate :organisation, to: :resource
end
