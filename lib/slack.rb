class Slack
  require 'faraday'
  SLACK_TOKEN = Rails.application.credentials.slack_token

  def self.slack
    @slack ||= Faraday.new('https://slack.com/api/') 
  end

  def self.send_message(channel_id, msg)
    response = slack.post('chat.postMessage') do |req|
      req.headers[:content_type] = 'application/json'
      req.headers["Authorization"] = "Bearer #{SLACK_TOKEN}"
      req.headers[:charset] = 'text/plain'
      req.body = JSON.generate(
        {
          "text" => msg,
          "channel" => channel_id
        }
      )
    end
  end
end
