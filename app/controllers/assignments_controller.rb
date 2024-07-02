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
    response = { 'test' => "value" }
    render json: response
  end

  def send_message
    org = Organisation.first
    all_changes = JSON.parse(request.raw_post)
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
