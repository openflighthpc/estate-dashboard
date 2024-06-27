class Resource < ApplicationRecord
  belongs_to :organisation
  has_many :change_requests, dependent: :destroy
  has_many :resource_assignments, dependent: :destroy

  validates :platform, :resource_class, :location, presence: true
  validates :slot_capacity, numericality: { only_integer: true }
  validates :cost, numericality: true

  def pretty_display
    msg = "Resource ##{self.id}:\n\tOwner: #{Organisation.find(self.organisation_id).name}"
    self.attributes.each do |field, value|
      if !['id', 'organisation_id', 'created_at', 'updated_at'].include?(field)
        msg << "\n\t#{field.humanize(keep_id_suffix: true)}: #{value}"
      end
    end
    msg
  end

  def unassigned_slots
    slot_capacity - resource_assignments.pluck(:no_slots).sum
  end
end
