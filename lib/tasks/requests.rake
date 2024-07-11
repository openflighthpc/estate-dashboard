namespace :requests do

  desc "List past change requests"
  task :list => :environment do
    ChangeRequest.find_each do |req|
      puts req.pretty_display
    end
  end

  namespace :assignments do
    task :list_pending => :environment do
      AssignmentChangeRequest.where(status: 'PENDING').each do |pending_request|
        puts ["-" * 60]
        puts "Request #{pending_request.id} (created at #{pending_request.created_at})"
        puts pending_request.slack_message
        puts ["-" * 60]
        puts " "
      end
    end

    task :apply, [:request_id] => :environment do |t, args|
      request = AssignmentChangeRequest.find(args[:request_id])
      request.apply
      request.update(status: 'COMPLETE')
    end
  end
end
