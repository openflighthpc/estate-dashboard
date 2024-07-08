class AssignmentsController < ApplicationController
  protect_from_forgery with: :null_session

  def show
    get_resource_data
  end
  def edit
    get_resource_data
    @props = { name: "Stranger" }
  end

  def raw_data
    get_organisation
    response = {
      organisationId: @organisation.id,
      resourceGroups: @organisation.resource_groups.select(:id, :name),
      assignments: @organisation.assigned_resources,
    }
    render json: response
  end

  def send_message
    data = JSON.parse(request.raw_post)
    org = Organisation.find(data['organisationId'])
    assignment_change_request = AssignmentChangeRequest.create
    data['changes'].each do |res_group|
      group_id = res_group["groupId"]
      res_group["changes"].each do |change|
        assignment = PendingResourceAssignment.new(
          no_slots: change["nowAssigned"],
          resource_id: change["resourceId"],
          resource_group_id: group_id,
          assignment_change_request_id: assignment_change_request.id
        )
        assignment_change_request.pending_resource_assignments << assignment
      end
    end
    org.send_message(assignment_change_request.slack_message)
    response = { result: "Message sent successfully" }
    render json: response
  end

  private

  def get_organisation
    params.permit :organisation_id
    @organisation = Organisation.find(params[:organisation_id])
  end

  def get_resource_data
    get_organisation
    @resource_groups = @organisation.resource_groups
    @unassigned_resources = @organisation.unassigned_resources
  end
end
