Rails.application.routes.draw do
  get 'hello_world', to: 'hello_world#index'
  root "home#index"

  get "org/:org_name",            to: "organisation#show"
  get "org/:org_name/change",     to: "organisation#change"
  get "org/:org_name/raw-data",   to: "organisation#raw_data"
  post "send-message/",           to: "organisation#send_message"
end
