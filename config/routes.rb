Rails.application.routes.draw do
  get 'hello_world', to: 'hello_world#index'
  root "home#index"

  resources :organisations, only: [:show, :edit]
  resource :assignment, only: [:show, :edit]
  resolve('Assignment') { [:assignment] }

  get "org/:org_name/raw-data",   to: "organisations#raw_data"
  post "send-message/",           to: "organisations#send_message"
end
