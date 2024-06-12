class Change < ApplicationRecord
  belongs_to :resource

  def pretty_display
    msg = ""
    self.attributes.each do |field, value|
      if !['id', 'resource_id', 'org_id', 'created_at', 'updated_at'].include?(field) && value
        msg << "\n\tSet #{field.humanize(keep_id_suffix: true)} to #{value}"
      end
    end
    msg = "#{self.created_at}: Change applied for resource ##{self.resource_id}:" + msg
  end
end
