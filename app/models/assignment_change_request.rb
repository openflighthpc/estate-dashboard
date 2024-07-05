class AssignmentChangeRequest < ApplicationRecord
  has_many :pending_resource_assignments

  validates :status, inclusion: {
    in: %w(PENDING COMPLETED CANCELLED),
    message: 'must be either PENDING COMPLETED or CANCELLED'
  }

  def organisation
    @organisation ||= pending_resource_assignments.first.organisation
  end

  def slack_message
    msg = ["-" * 30, "Resource assignment request received from *#{organisation.name}*:", "\n"]
    resource_group_ids = pending_resource_assignments.pluck(:resource_group_id).uniq.sort
    resource_group_ids.each do |group_id|
      group = ResourceGroup.find(group_id)
      msg << "*#{group.name}*"
      pending_resource_assignments.where(resource_group_id: group.id).each do |ass|
        resource = ass.resource
        change_string = "#{ass.no_slots}"
        msg << "Resource #{resource.id} - #{resource.platform} #{resource.resource_class} #{'burst' if ass.burst}:   #{change_string}"
      end
      msg << "\n"
    end
    msg.join("\n")
  end
end
