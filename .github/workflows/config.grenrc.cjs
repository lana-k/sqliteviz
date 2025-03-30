module.exports = {
  dataSource: 'milestones',
  ignoreIssuesWith: ['wontfix', 'duplicate'],
  milestoneMatch: 'v{{tag_name}}',
  template: {
    issue: '- {{name}} [{{text}}]({{url}})',
    changelogTitle: '',
    release: '{{body}}'
  },
  groupBy: {
    Enhancements: ['enhancement', 'internal'],
    'Bug fixes': ['bug']
  }
}
