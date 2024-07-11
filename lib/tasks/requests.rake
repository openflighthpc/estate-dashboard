namespace :requests do

  desc "List past change requests"
  task :list => :environment do
    ChangeRequest.find_each do |req|
      puts req.pretty_display
    end
  end

  namespace :assignments do
    desc "List pending requested resource assignments"
    task :list_pending => :environment do
      AssignmentChangeRequest.where(status: 'PENDING').each do |pending_request|
        puts ["-" * 60]
        puts "Request #{pending_request.id} (created at #{pending_request.created_at})"
        puts pending_request.slack_message
        puts ["-" * 60]
        puts " "
      end
    end

    desc "Apply the changes from an assignment change request"
    task :apply, [:request_id] => :environment do |t, args|
      request = AssignmentChangeRequest.find(args[:request_id])
      request.apply
      request.update(status: 'COMPLETE')
    end

    desc "Cancel an assignment change request"
    task :cancel, [:request_id] => :environment do |t, args|
      request = AssignmentChangeRequest.find(args[:request_id])
      request.update(status: 'CANCELLED')
    end
  end
end
