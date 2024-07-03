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
    org = Organisation.first
    response = {
      organisationId: org.id,
      resourceGroups: org.resource_groups.select(:id, :name),
      assignments: org.assigned_resources,
    }
    render json: response
  end

  def send_message
    data = JSON.parse(request.raw_post)
    org = Organisation.find(data['organisationId'])
    all_changes = data['changes']
    msg = ["-" * 30, "Resource assignment request received from *#{org.name}*:", "\n"]
    all_changes.each do |res_group|
      msg << "*#{ResourceGroup.find(res_group["groupId"]).name}*"
      res_group["changes"].each do |change|
        res = Resource.find(change["resourceId"])
        msg << "Resource #{res.id} - #{res.platform} #{res.resource_class}:   #{change["initiallyAssigned"]} --> #{change["nowAssigned"]}"
      end
      msg << "\n"
    end
    org.send_message(msg.join("\n"))
    response = { result: "Message sent successfully" }
    render json: response
  end

  private

  def get_resource_data
    params.permit :organisation_id
    @organisation = Organisation.find(params[:organisation_id])
    @resource_groups = @organisation.resource_groups
    @unassigned_resources = @organisation.unassigned_resources
  end
end
