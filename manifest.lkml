project_name: "multiple-tile"

# # Use local_dependency: To enable referencing of another project
# # on this instance with include: statements
#
# local_dependency: {
#   project: "name_of_other_project"
# }

application: multiple-tile {
  label: "multiple-ext"
  url: "http://localhost:8080/bundle.js"
  # file: "bundle.js
  entitlements: {
    core_api_methods: ["me"] #Add more entitlements here as you develop new functionality
  }
  mount_points: {
    dashboard_vis: yes
    dashboard_tile: yes
    standalone: yes
  }
}
