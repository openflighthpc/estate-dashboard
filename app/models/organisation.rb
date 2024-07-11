class Organisation < ApplicationRecord
  has_many :resources, dependent: :destroy
  has_many :resource_groups, dependent: :destroy

  validates :name, presence:true, uniqueness: true

  def pretty_display
    msg = "'#{self.name}:'"
    self.attributes.each do |field, value|
      if !['id', 'created_at', 'updated_at'].include?(field)
        msg << "\n\t#{field.humanize(keep_id_suffix: true)}: #{value}"
      end
    end
    msg
  end

  def send_message(msg)
    Slack.send_message(self.channel_id, msg)
  end

  def unassigned_resources
    resources.map do |res|
      if res.unassigned_slots > 0
        {
          resource: res,
          unassigned_slots: res.unassigned_slots,
        }
      end
    end.compact
  end

  def assigned_resources
    {
      burst: resources.where(burst: true).map { |res| res.assignment_details },
      dedicated: resources.where(burst: false).map { |res| res.assignment_details },
    }
  end

  def pending_resource_assignments
    pending_assignments = []
    PendingResourceAssignment.joins(:assignment_change_request)
                             .where(assignment_change_request: {status: 'PENDING', organisation_id: id})
                             .order(created_at: :desc)
                             .each do |pending_ass|
                               pending_assignments.push(pending_ass) unless pending_assignments.pluck(:resource_id, :resource_group_id).find { |a|
                                 a == [pending_ass.resource_id, pending_ass.resource_group_id]
                               }
                             end
    pending_assignments
  end
end
