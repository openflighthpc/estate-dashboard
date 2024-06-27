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
end
