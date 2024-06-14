class HomeController < ApplicationController

  def index
    @organisations = Organisation.all
  end

end
