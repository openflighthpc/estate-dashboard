class OrganisationController < ApplicationController

  def show
    @org = Organisation.find_by(name: params[:org_name])
  end

  def raw_data
    # org = Organisation.find_by(name: params[:org_name])
    # response = {}
    # response[:organisation] = org.name
    # resources = []
    # org.resources.each do |res|
    #   resources << { 'id': res.id,
    #                  'platform': res.platform,
    #                  'location': res.location,
    #                  'capacity': { 'dedicated': res.slot_capacity * 0.8,
    #                                'utilisedBurst': res.slot_capacity * 0.1,
    #                                'maxBurst': res.burst ? res.slot_capacity * 0.2 : 0,
    #                                'utilisedTotal': res.slot_capacity * 0.6,
    #                                'maxTotal': res.slot_capacity
    #                              },
    #                  'cost': { 'dedicated': res.cost * 0.8,
    #                            'utilisedBurst': res.cost * 0.1,
    #                            'maxBurst': res.burst ? res.cost * 0.2 : 0,
    #                            'utilisedTotal': res.cost * 0.6,
    #                            'maxTotal': res.cost
    #                          }
    #                }
    # end
    # response[:resources] = resources
    response = {
      'organization' => {
        'name' => 'org name'
      },
      'date' => {
        'startDate' => 12345678,
        'endDate' => 12345678
      },
      'capacity' => {
        'dedicated' => 120,
        'utilizedBurst' => 15,
        'maxBurst' => 40,
        'utilizedTotal' => 160,
        'maxTotal' => 160
      },
      'cost' => {
        'dedicated' => 12,
        'utilizedBurst' => 2.61,
        'maxBurst' => 8,
        'utilizedTotal' => 14.61,
        'maxTotal' => 20
      },
      'resources' => [
        {
          'id' => '1',
          'platform' => 'Alces Cloud',
          'location' => 'GBR',
          'capacity' => {
            'dedicated' => 65,
            'utilizedBurst' => 10,
            'maxBurst' => 12,
            'utilizedTotal' => 75,
            'maxTotal' => 77
          },
          'cost' => {
            'dedicated' => 5,
            'utilizedBurst' => 1.5,
            'maxBurst' => 1.8,
            'utilizedTotal' => 6.5,
            'maxTotal' => 6.8
          }
        },
        {
          'id' => '2',
          'platform' => 'AWS',
          'location' => 'GBR',
          'capacity' => {
            'dedicated' => 20,
            'utilizedBurst' => 0,
            'maxBurst' => 0,
            'utilizedTotal' => 20,
            'maxTotal' => 20
          },
          'cost' => {
            'dedicated' => 3,
            'utilizedBurst' => 0,
            'maxBurst' => 0,
            'utilizedTotal' => 3,
            'maxTotal' => 3
          }
        },
        {
          'id' => '3',
          'platform' => 'On Premise',
          'location' => 'GBR',
          'capacity' => {
            'dedicated' => 35,
            'utilizedBurst' => 5,
            'maxBurst' => 28,
            'utilizedTotal' => 40,
            'maxTotal' => 63
          },
          'cost' => {
            'dedicated' => 4,
            'utilizedBurst' => 1.11,
            'maxBurst' => 6.2,
            'utilizedTotal' => 5.11,
            'maxTotal' => 10.2
          }
        },
      ],
    }

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
