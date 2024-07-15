class AssignmentsController < ApplicationController
  protect_from_forgery with: :null_session

  def show
    get_resource_data
  end

  def edit
    get_resource_data
  end

  def raw_data
    get_organisation
    response = {
      organisationId: @organisation.id,
      resourceGroups: @organisation.resource_groups.select(:id, :name),
      assignments: @organisation.assigned_resources,
      pendingAssignments: @organisation.pending_resource_assignments
    }
    render json: response
  end

  def send_message
    data = JSON.parse(request.raw_post)
    org = Organisation.find(data["organisationId"])
    assignments = []
    data["changes"].each do |res_group|
      group_id = res_group["groupId"]
      res_group["changes"].each do |change|
        assignments << PendingResourceAssignment.new(
          no_slots: change["nowAssigned"],
          resource_id: change["resourceId"],
          resource_group_id: group_id
        )
      end
    end
    assignment_change_request = AssignmentChangeRequest.create(organisation_id: org.id)
    assignments.each { |ass| assignment_change_request.pending_resource_assignments << ass }
    r = org.send_message(assignment_change_request.slack_message)
    response = {result: r.success? ? "Request sent successfully" : "Request failed"}
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
