class Resource < ApplicationRecord
  belongs_to :organisation
  has_many :change_requests, dependent: :destroy
  has_many :resource_assignments, dependent: :destroy
  has_many :pending_resource_assignments, dependent: :destroy

  validates :platform, :resource_class, :location, presence: true
  validates :slot_capacity, numericality: {only_integer: true}
  validates :cost, numericality: true

  def pretty_display
    msg = "Resource ##{id}:\n\tOwner: #{Organisation.find(organisation_id).name}"
    attributes.each do |field, value|
      if !["id", "organisation_id", "created_at", "updated_at"].include?(field)
        msg << "\n\t#{field.humanize(keep_id_suffix: true)}: #{value}"
      end
    end
    msg
  end

  def unassigned_slots
    slot_capacity - resource_assignments.pluck(:no_slots).sum
  end

  def assignment_details
    {
      id: id,
      name: [platform, resource_class].join(" "),
      assignments: organisation.resource_groups.map do |group|
        {
          groupId: group.id,
          assignedSlots: resource_assignments.find_by(resource_group_id: group.id)&.no_slots || 0
        }
      end,
      totalSlots: slot_capacity
    }
  end

  def pending_assignment_details
    organisation.resource_groups.map do |group|
      {
        groupId: group.id,
        assignedSlots: pending_resource_assignments
          .where(resource_group_id: group.id)
          .order(created_at: :desc)
          .first&.no_slots || resource_assignments.find_by(resource_group_id: group.id)&.no_slots || 0
      }
    end
  end
end
