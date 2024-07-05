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
    assignment_change_request = AssignmentChangeRequest.new
    all_changes = data['changes']
    msg = ["-" * 30, "Resource assignment request received from *#{org.name}*:", "\n"]
    all_changes.each do |res_group|
      group_id = res_group["groupId"]
      msg << "*#{ResourceGroup.find(group_id).name}*"
      res_group["changes"].each do |change|
        res_id = change["resourceId"]
        slots_to_assign = change["nowAssigned"]
        is_burst = change["isBurst"]
        res = Resource.find(res_id)
        assignment = ResourceAssignment.new(
          no_slots: slots_to_assign,
          resource_id: res_id,
          resource_group_id: group_id,
          burst: is_burst,
          pending: true,
        )
        assignment_change_request.resource_assignments << assignment
        change_string = "#{change["initiallyAssigned"]} --> #{slots_to_assign}"
        msg << "Resource #{res.id} - #{res.platform} #{res.resource_class} #{'burst' if is_burst}:   #{change_string}"
      end
      msg << "\n"
    end
    assignment_change_request.save
    org.send_message(msg.join("\n"))
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
