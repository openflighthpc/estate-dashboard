namespace :requests do
  desc "List past change requests"
  task list: :environment do
    ChangeRequest.find_each do |req|
      puts req.pretty_display
    end
  end

  namespace :assignments do
    desc "List pending requested resource assignments"
    task :list, [:status] => :environment do |t, args|
      status = args[:status]
      requests = status ? AssignmentChangeRequest.where(status: status.upcase) : AssignmentChangeRequest.all
      requests.each do |pending_request|
        puts ["-" * 60]
        puts "Request #{pending_request.id} (created at #{pending_request.created_at})"
        puts pending_request.slack_message
        puts ["-" * 60]
        puts " "
      end
    end
  end
end
