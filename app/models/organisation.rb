class Organisation < ApplicationRecord
  has_many :resources, dependent: :destroy

  validates :name, uniqueness: true

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
end
