class Organisation < ApplicationRecord
  has_many :resources, dependent: :destroy

  validates :name, uniqueness: true

  def pretty_display
    "'#{self.name}':\n\tSlack Channel Name: #{self.channel_name}\n\tSlack Channel ID: #{self.channel_id}"
  end

  def send_message(msg)
    Slack.send_message(self.channel_id, msg)
  end
end
