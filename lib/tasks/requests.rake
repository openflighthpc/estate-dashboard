namespace :requests do

  desc "List past change requests"
  task :list => :environment do
    ChangeRequest.find_each do |req|
      puts req.pretty_display
    end
  end

end
