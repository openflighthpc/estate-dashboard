class Organisation < ApplicationRecord
  has_many :resources, dependent: :destroy

  def pretty_display
    "'#{self.name}':\n\tSlack Channel Name: #{self.channel_name}\n\tSlack Channel ID: #{self.channel_id}"
  end
end
