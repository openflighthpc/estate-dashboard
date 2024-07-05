class AssignmentChangeRequest < ApplicationRecord
  has_many :resource_assignments

  validates :status, inclusion: {
    in: %w(PENDING COMPLETED CANCELLED),
    message: 'must be either PENDING COMPLETED or CANCELLED'
  }
end
