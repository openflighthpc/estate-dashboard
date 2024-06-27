class AssignmentsController < ApplicationController
  def show
    @resource_groups = ResourceGroup.all
  end
  def edit
    @props = { name: "Stranger" }
  end
end
