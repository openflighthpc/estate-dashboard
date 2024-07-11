namespace :requests do
  desc "List past change requests"
  task list: :environment do
    ChangeRequest.find_each do |req|
      puts req.pretty_display
    end
  end

  namespace :assignments do
    desc "List pending requested resource assignments"
    task list_pending: :environment do
      AssignmentChangeRequest.where(status: "PENDING").each do |pending_request|
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
      request.update(status: "COMPLETE")
    end

    desc "Cancel an assignment change request"
    task :cancel, [:request_id] => :environment do |t, args|
      request = AssignmentChangeRequest.find(args[:request_id])
      request.update(status: "CANCELLED")
    end

    namespace :resource_groups do
      desc "Create a resource group"
      task create: :environment do
        print "Organisation (name or ID): "
        org = $stdin.gets.chomp
        org_id = Organisation.pluck(:id).include?(org.to_i) ? org.to_i : Organisation.find_by(name: org)&.id
        if org_id
          print "Name: "
          name = $stdin.gets.chomp
          print "Description (optional): "
          description = $stdin.gets.chomp
          ResourceGroup.create(name: name, description: description, organisation_id: org_id)
          puts "#{name} resource group created"
        else
          puts "No organisation exists with that name or ID"
        end
      end
    end
  end
end
