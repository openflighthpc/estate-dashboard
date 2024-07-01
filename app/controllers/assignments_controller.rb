class AssignmentsController < ApplicationController
  protect_from_forgery with: :null_session

  def show
    get_resource_data
  end
  def edit
    get_resource_data
    @props = { name: "Stranger" }
  end

  def send_message
    org = Organisation.first
    msg = "\nTest message"
    msg = "-" * 30 + "\nResource assignment request received from *#{org.name}*:" + msg
    org.send_message(msg)
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
