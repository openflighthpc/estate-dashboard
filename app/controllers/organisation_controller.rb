class OrganisationController < ApplicationController

  def show
    @org = Organisation.find_by(name: params[:org_name])
  end

  def send_message
    org = Organisation.find(params["org_id"])
    res = org.resources.find_by(id: params["resource_id"])
    change_request = ChangeRequest.new(resource_id: res.id)

    msg = ""
    params.each do |key, value|
      if !['resource_id', 'controller', 'action', 'org_id'].include?(key) && (res[key].to_s != value) && !value.blank?
        change_request[key] = value
        msg << "\n\t*#{key.humanize(keep_id_suffix: true)}:* #{res[key]} -> *#{value}*"
      end
    end
    if !msg.blank?
      msg = "-" * 30 + "\nChange request received from *#{org.name}* for *resource ##{res.id}*:" + msg
      org.send_message(msg)
      change_request.save
    end
  end

end
