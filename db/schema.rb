# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2024_06_27_124641) do
  create_table "change_requests", force: :cascade do |t|
    t.integer "resource_id", null: false
    t.string "platform"
    t.string "resource_class"
    t.integer "slot_capacity"
    t.string "location"
    t.boolean "burst"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["resource_id"], name: "index_change_requests_on_resource_id"
  end

  create_table "changes", force: :cascade do |t|
    t.integer "resource_id", null: false
    t.string "platform"
    t.string "resource_class"
    t.integer "slot_capacity"
    t.string "location"
    t.boolean "burst"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["resource_id"], name: "index_changes_on_resource_id"
  end

  create_table "organisations", force: :cascade do |t|
    t.string "name"
    t.string "channel_name"
    t.string "channel_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "resource_groups", force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.integer "organisation_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organisation_id"], name: "index_resource_groups_on_organisation_id"
  end

  create_table "resources", force: :cascade do |t|
    t.integer "organisation_id", null: false
    t.string "platform"
    t.string "resource_class"
    t.integer "slot_capacity"
    t.float "cost"
    t.string "location"
    t.boolean "burst"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["organisation_id"], name: "index_resources_on_organisation_id"
  end

  add_foreign_key "resource_groups", "organisations"
end
