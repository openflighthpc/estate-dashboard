# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

example_org = Organisation.find_or_create_by!(
  name: "Example",
  channel_name: 'example_channel',
  channel_id: 1234567890
)

Resource.create!([
  {
    platform: 'Alces Cloud',
    resource_class: 'Compute (Medium)',
    slot_capacity: 65,
    cost: 5,
    location: 'GBR',
    burst: false,
    organisation_id: example_org.id
  },
  {
    platform: 'Alces Cloud',
    resource_class: 'Compute (Medium)',
    slot_capacity: 12,
    cost: 1.8,
    location: 'GBR',
    burst: true,
    organisation_id: example_org.id
  },
  {
    platform: 'AWS',
    resource_class: 'GPU (Medium)',
    slot_capacity: 20,
    cost: 3,
    location: 'GBR',
    burst: false,
    organisation_id: example_org.id
  },
  {
    platform: 'On Premise',
    resource_class: 'Compute (Large)',
    slot_capacity: 35,
    cost: 4,
    location: 'GBR',
    burst: false,
    organisation_id: example_org.id
  },
  {
    platform: 'On Premise',
    resource_class: 'Compute (Large)',
    slot_capacity: 28,
    cost: 6.2,
    location: 'GBR',
    burst: true,
    organisation_id: example_org.id
  }
])
