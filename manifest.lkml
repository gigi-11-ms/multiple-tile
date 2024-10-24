project_name: "viz-multiple"

constant: VIS_LABEL {
  value: "Multiple Value Visualization"
  export: override_optional
}

constant: VIS_ID {
  value: "mviz-multiple"
  export:  override_optional
}

visualization: {
  id: "@{VIS_ID}"
  url: "https://marketplace-api.looker.com/viz-dist/multiple_value.js"
  label: "@{VIS_LABEL}"
}
