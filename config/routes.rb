Rails.application.routes.draw do
  root "home#index"

  get "org/:org_name",  to: "organisation#show"
  post "send-message/", to: "organisation#send_message"
end
