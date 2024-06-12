namespace :changes do

  desc "List past changes to resources"
  task :list => :environment do
    Change.find_each do |change|
      puts change.pretty_display
    end
  end

end
