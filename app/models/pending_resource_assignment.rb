class PendingResourceAssignment < ApplicationRecord
  belongs_to :assignment_change_request
  belongs_to :resource_group
  belongs_to :resource

  delegate :organisation, to: :resource

  def pretty_display
    "Resource #{resource.id} - #{resource.platform} #{resource.resource_class} #{'(burst)' if resource.burst}:  #{no_slots}"
  end
end
