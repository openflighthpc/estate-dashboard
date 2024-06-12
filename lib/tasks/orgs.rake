namespace :orgs do
  editor = ENV['EDITOR'] || "vim"

  desc "Create a new organisation"
  task :create => :environment do
    questions = {}
    Organisation.columns_hash.values.each do |field|
      if !['id', 'created_at', 'updated_at'].include?(field.name)
        questions[field.name.humanize(keep_id_suffix: true)] = nil
      end
    end
    File.write('tmp/org_create.yaml', questions.to_yaml)
    system(editor, 'tmp/org_create.yaml')
    answers = YAML.load_file('tmp/org_create.yaml')
    File.delete('tmp/org_create.yaml')
    answers = answers.map { |k, v| [k.dehumanize.to_sym, v] }.to_h
    Organisation.create(**answers)
    puts "Organisation created"
  end

  desc "List existing organisations"
  task :list => :environment do
    Organisation.find_each do |org|
      puts org.pretty_display
    end
  end

  desc "Edit an organisation"
  task :edit, [:org_name] => :environment do |t, args|
    if !args[:org_name]
      puts "Organisation name is required"
      next
    end
    org = Organisation.find_by(name: args[:org_name])
    if !org
      puts "Organisation '#{args[:org_name]}' not found"
      next
    end
    questions = {}
    org.attributes.each do |field, value|
      if !['id', 'created_at', 'updated_at'].include?(field)
        questions[field.humanize(keep_id_suffix: true)] = value
      end
    end
    File.write('tmp/org_edit.yaml', questions.to_yaml)
    system(editor, 'tmp/org_edit.yaml')
    answers = YAML.load_file('tmp/org_edit.yaml')
    File.delete('tmp/org_edit.yaml')
    answers = answers.map { |k, v| [k.dehumanize.to_sym, v] }.to_h
    org.update(**answers)
    puts "Details updated"
  end

  desc "Delete an organisation"
  task :delete, [:org_name] => :environment do |t, args|
    org_name = args[:org_name]
    if !org_name
      puts "Organisation name is required"
      next
    end
    org = Organisation.find_by(name: org_name)
    if !org
      puts "Organisation '#{org_name}' not found"
      next
    end
    puts "CAUTION. You are attempting to delete the organisation '#{org_name}'. This action will permanently delete the organisation and all associated resources."
    print "Continue? (y/N) >"
    confirm = gets.chomp
    if confirm.downcase == 'y'
      org.destroy
      puts "Organisation '#{org_name}' deleted"
    else
      puts "Confirmation not received, deletion aborted."
    end
  end
end
