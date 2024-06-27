class AssignmentsController < ApplicationController
  def show
    get_resource_data
  end
  def edit
    get_resource_data
    @props = { name: "Stranger" }
  end

  def get_resource_data
    params.permit :organisation_id
    @organisation = Organisation.find(params[:organisation_id])
    @resource_groups = @organisation.resource_groups
    @unassigned_resources = @organisation.unassigned_resources
  end
end
