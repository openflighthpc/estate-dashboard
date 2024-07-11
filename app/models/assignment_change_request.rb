class AssignmentChangeRequest < ApplicationRecord
  has_many :pending_resource_assignments

  validates :status, inclusion: {
    in: %w(PENDING COMPLETE CANCELLED),
    message: 'must be either PENDING COMPLETED or CANCELLED'
  }

  def organisation
    @organisation ||= pending_resource_assignments.first.organisation
  end

  def slack_message
    return 'No changes requested' if pending_resource_assignments.empty?
    msg = ["-" * 30, "Resource assignment request received from *#{organisation.name}*:", "\n"]
    resource_group_ids = pending_resource_assignments.pluck(:resource_group_id).uniq.sort
    resource_group_ids.each do |group_id|
      group = ResourceGroup.find(group_id)
      msg << "*#{group.name}*"
      pending_resource_assignments.where(resource_group_id: group.id).each do |ass|
        msg << ass.pretty_display
      end
      msg << "\n"
    end
    msg.join("\n")
  end

  def apply
    pending_resource_assignments.each do |pending_ass|
      existing = ResourceAssignment.find_by(
        resource_id: pending_ass.resource_id,
        resource_group_id: pending_ass.resource_group_id,
      )
      if existing
        existing.update(
          no_slots: pending_ass.no_slots
        )
      else
        ResourceAssignment.create(
          resource_id: pending_ass.resource_id,
          resource_group_id: pending_ass.resource_group_id,
          no_slots: pending_ass.no_slots,
        )
      end
    end
  end
end
