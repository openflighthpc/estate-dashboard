class OrganisationController < ApplicationController

  def show
    @org = Organisation.find_by(name: params[:org_name])
  end

  def raw_data
    @org = Organisation.find_by(name: params[:org_name])
    response = {}.tap do |res|
      res[:organisation] = org.name
      res[:resources] = []
      org.resources.each do |res|
        res[:resources] << { 'id': res.id,
                             'platform': res.platform,
                             'location': res.location,
                             'capacity': { 'dedicated': res.slot_capacity * 0.8,
                                           'utilisedBurst': res.slot_capacity * 0.1,
                                           'maxBurst': org.burst ? res.slot_capacity * 0.2 : 0,
                                           'utilisedTotal': res.slot_capacity * 0.6,
                                           'maxTotal': res.slot_capacity
                                         },
                             'cost': { 'dedicated': res.cost * 0.8,
                                       'utilisedBurst': res.cost * 0.1,
                                       'maxBurst': org.burst ? res.cost * 0.2 : 0,
                                       'utilisedTotal': res.cost * 0.6,
                                       'maxTotal': res.cost
                                     }
                           }
      end
      res[:total_capacity] =  { 'dedicated': res[:resources].map { |res| res['capacity']['dedicated'] }.sum,
                                'utilisedBurst': res[:resources].map { |res| res['capacity']['utilisedBurst'] }.sum,
                                'maxBurst': res[:resources].map { |res| res['capacity']['maxBurst'] }.sum,
                                'utilisedTotal': res[:resources].map { |res| res['capacity']['utilisedTotal'] }.sum,
                                'maxTotal': res[:resources].map { |res| res['capacity']['maxTotal'] }.sum
                              }
    end
  
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
