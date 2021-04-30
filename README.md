<p align="center">
   <img src="src/assets/images/Logo.svg"/>
</p>

# sqliteviz

Sqliteviz is a single-page PWA for fully client-side visualisation of SQLite databases or CSV.

This tool allows:
- run SQL queries in sqlite database and create all kinds of charts based on result set
- import CSV into sqlite database and visualize imported data
- save queries and chart settings
- export queries and chart settings to JSON file
- import queries and chart settings from JSON file
- manipulate saved queries (rename, duplicate, delete)
- set predefined queries available for all users of sqliteviz on your server (read more about predefind queries on [Wiki][10])
- export modified database
- use it offline

## Get started
The latest release of sqliteviz is running on [Github pages][6]. The simplest way to start is to use sqliteviz there.

## Wiki
For user documentation, check out sqliteviz [Wiki][7].

## Motivation
It's a kind of middleground between [Plotly Falcon][1] and [Redash][2].

## Components
It is built on top of [react-chart-editor][3], [sql.js][4] and [Vue-Codemirror][8] in [Vue.js][5]. CSV parsing is performed with [Papa Parse][9].

[1]: https://github.com/plotly/falcon
[2]: https://github.com/getredash/redash
[3]: https://github.com/plotly/react-chart-editor
[4]: https://github.com/sql-js/sql.js
[5]: https://github.com/vuejs/vue
[6]: https://lana-k.github.io/sqliteviz
[7]: https://github.com/lana-k/sqliteviz/wiki
[8]: https://github.com/surmon-china/vue-codemirror#readme
[9]: https://www.papaparse.com/
[10]: https://github.com/lana-k/sqliteviz/wiki/Predefined-queries
