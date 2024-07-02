Rails.application.routes.draw do
  root "home#index"

  resources :organisations, only: [:show, :edit]
  resource :assignment, only: [:show, :edit]
  resolve('Assignment') { [:assignment] }

  get "org/:org_name/raw-data",         to: "organisations#raw_data"
  post "send-message/",                 to: "organisations#send_message"
  get "assignment/raw-data/",           to: "assignments#raw_data"
  post "assignment/send-message/",      to: "assignments#send_message"
end
