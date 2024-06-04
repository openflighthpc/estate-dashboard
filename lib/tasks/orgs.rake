namespace :orgs do
  editor = ENV['EDITOR'] || "vim"
  task :create do
    puts YAML.dump({"test" => "", "test2" => "2"})
  end

  task :list do
    puts editor
  end

  task :edit do
    system(editor, 'some_temp_file.txt')
  end

end
