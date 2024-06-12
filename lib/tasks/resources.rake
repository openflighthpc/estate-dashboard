namespace :resources do
  editor = ENV['EDITOR'] || "vim"

  desc "Create a new resource"
  task :create, [:org_name] => :environment do |t, args|
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
    questions = {}
    Resource.columns_hash.values.each do |field|
      if !['id', 'organisation_id', 'created_at', 'updated_at'].include?(field.name)
        questions[field.name.humanize(keep_id_suffix: true)] = nil
      end
    end
    File.write('tmp/res_create.yaml', questions.to_yaml)
    system(editor, 'tmp/res_create.yaml')
    answers = YAML.load_file('tmp/res_create.yaml')
    File.delete('tmp/res_create.yaml')
    answers = answers.map { |k, v| [k.dehumanize.to_sym, v] }.to_h.merge({ :organisation_id => org.id })
    Resource.create(**answers)
    puts "Resource created"
  end

  desc "List existing resources for a given organisation"
  task :list, [:org_name] => :environment do |t, args|
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
    org.resources.each do |resource|
      puts resource.pretty_display
    end
  end

  desc "Edit a resource"
  task :edit, [:org_name, :res_id] => :environment do |t, args|
    if !args[:org_name]
      puts "Organisation name is required"
      next
    end
    org = Organisation.find_by(name: args[:org_name])
    if !org
      puts "Organisation '#{args[:org_name]}' not found"
      next
    end

    if !args[:res_id]
      puts "Resource ID is required"
      next
    end
    resource = org.resources.find_by(id: args[:res_id])
    if !resource
      puts "Resource ##{args[:res_id]} not found for organisation '#{org.name}'"
      next
    end
    questions = {}
    resource.attributes.each do |field, value|
      if !['id', 'organisation_id', 'created_at', 'updated_at'].include?(field)
        questions[field.humanize(keep_id_suffix: true)] = value
      end
    end
    File.write('tmp/res_edit.yaml', questions.to_yaml)
    system(editor, 'tmp/res_edit.yaml')
    answers = YAML.load_file('tmp/res_edit.yaml')
    File.delete('tmp/res_edit.yaml')
    answers = answers.map { |k, v| [k.dehumanize.to_sym, v] }.to_h
    resource.update(**answers)
  end

  desc "Delete a resource"
  task :delete, [:org_name, :res_id] => :environment do |t, args|
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

    if !args[:res_id]
      puts "Resource ID is required"
      next
    end
    resource = org.resources.find_by(id: args[:res_id])
    if !resource
      puts "Resource ##{args[:res_id]} not found for organisation '#{org.name}'"
      next
    end
    puts "CAUTION. You are attempting to delete resource ##{resource.id}. This action is permanent."
    print "Continue? (y/N) >"
    confirm = gets.chomp
    if confirm.downcase == 'y'
      resource.destroy
      puts "Resource ##{resource.id} deleted"
    else
      puts "Confirmation not received, deletion aborted."
    end
  end
end
