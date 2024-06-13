class OrganisationController < ApplicationController

  def show
    @org = Organisation.find_by(name: params[:org_name])
  end

  def change
    @org = Organisation.find_by(name: params[:org_name])
  end

  def raw_data
    org = Organisation.find_by(name: params[:org_name])
    response = {
      'organization' => {
        'name' => org.name
      },
      'date' => {
        'startDate' => 12345678,
        'endDate' => 12345678
      },
    }
    resources = []
    org.resources.each do |res|
      resources << { 'id': res.id,
                     'platform': res.platform,
                     'location': res.location,
                     'capacity': { 'dedicated': res.slot_capacity * 0.8,
                                   'utilisedBurst': res.slot_capacity * 0.1,
                                   'maxBurst': res.burst ? res.slot_capacity * 0.2 : 0,
                                   'utilisedTotal': res.slot_capacity * 0.6,
                                   'maxTotal': res.slot_capacity
                                 },
                     'cost': { 'dedicated': res.cost * 0.8,
                               'utilisedBurst': res.cost * 0.1,
                               'maxBurst': res.burst ? res.cost * 0.2 : 0,
                               'utilisedTotal': res.cost * 0.6,
                               'maxTotal': res.cost
                             }
                   }
    end
    response[:resources] = resources

    capacity = {
      'dedicated' => resources.sum{ |h| h[:capacity][:dedicated] },
      'utilizedBurst' => resources.sum{ |h| h[:capacity][:utilisedBurst] },
      'maxBurst' => resources.sum{ |h| h[:capacity][:maxBurst] },
      'utilizedTotal' => resources.sum{ |h| h[:capacity][:utilisedTotal] },
      'maxTotal' => resources.sum{ |h| h[:capacity][:maxTotal] }
    }
    response[:capacity] = capacity

    cost = {
      'dedicated' => resources.sum{ |h| h[:cost][:dedicated] },
      'utilizedBurst' => resources.sum{ |h| h[:cost][:utilisedBurst] },
      'maxBurst' => resources.sum{ |h| h[:cost][:maxBurst] },
      'utilizedTotal' => resources.sum{ |h| h[:cost][:utilisedTotal] },
      'maxTotal' => resources.sum{ |h| h[:cost][:maxTotal] }
    }

    response[:cost] = cost

    render json: response
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
