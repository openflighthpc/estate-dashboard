class Resource < ApplicationRecord
  belongs_to :organisation

  def pretty_display
    msg = "Resource ##{self.id}:\n\tOwner: #{Organisation.find(self.organisation_id).name}"
    self.attributes.each do |field, value|
      if !['id', 'organisation_id', 'created_at', 'updated_at'].include?(field)
        msg << "\n\t#{field.humanize(keep_id_suffix: true)}: #{value}"
      end
    end
    msg
  end
end
