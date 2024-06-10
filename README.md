# Estate Dashboard

This app enables users to see an overview of their resources and send requests to change their details.

## Initial Setup

- Ensure Ruby (3.2.2) and Bundler are installed on your device
- Ensure SQLite is installed on your device (`sqlite3 --version`)
- Run `bundle install`
- Update the application's database credentials using `EDITOR=vim rails credentials:edit` (replacing `vim` with the editor of your choice) and setting:
  - `slack_token` - Set this to the token for the Slack bot you are using. This token will start with `xoxb-`. The bot must have permission to send messages to the desired channel, and must be invited to the channel first. Alces Flight admins should use Estate DashBot's token for this field, which is available on request.
- Run `bin/rails db:migrate`

## Operation

### Hosting the server
- Run the application with `rails s`
- By default it will be accessible at `http://localhost:3000/`. This can be changed by adding `-b` and `-p` when running `bin/rails s`. For example `rails s -b 0.0.0.0 -p 4567`

### Modifying the data

Admins with access to the hosting server may make use of the following Rake tasks to modify the database. The terms `rails` and `rake` are interchangeable in the following commands. Some of the commands involve the direct modification of several data fields simultaneously - in this case, the commands will make use of your default text editor, which may be overriden through the `EDITOR` environment variable, e.g. `EDITOR=vim rails orgs:create`.

#### Organisations
* `rails orgs:create` - Create a new organisation.
* `rails orgs:list` - List all organisations.
* `rails orgs:edit[<org_name>]` - Edit the details of a given organisation.
* `rails orgs:delete[<org_name>]` - Delete a given organisation.

#### Resources
* `rails resources:create[<org_name>]` - Create a new resource for the given organisation.
* `rails resources:list[<org_name>]` - List all existing resources for the given organisation.
* `rails resources:edit[<org_name>, <resource_id>]` - Edit the details of a given resource.
* `rails resources:delete[<org_name>, <resource_id>]` - Delete a given resource.

#### Requests
* `rails requests:list` - List past change requests from users
