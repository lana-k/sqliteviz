# SQLite WebAssembly build

This directory contains Docker-based build script, `build.sh`, that builds
custom version of [sql.js][1]. It uses more recent version of SQLite itself.

SQLite [amalgamation][2] extensions included:

1. [FTS5][4] -- virtual table module that provides full-text search
   functionality

TODO: SQLite [miscellaneous extensions][3] included:

1. `generate_series` table-valued [series function][6] ([series.c][7])
2. `transitive_closure` virtual table ([closure.c][8])
3. `compress` and `uncompress` functions using ZLIB ([compress.c][9])
4. `uuid`, `uuid_str` and `uuid_blob` RFC-4122 UUID functions ([uuid.c][10])
5. `regexp` function ([regexp.c][11])
6. `eval` function which runs SQL statements recursively ([eval.c][12])

SQLite 3rd party extensions included:

1. [pivot_vtab][5] -- a pivot virtual table

To ease the step to have working clone locally, the build is committed into
the repository.

`Makefile.sql-js` is a modified version of the `Makefile` from [sql.js][1].

[1]:  https://github.com/sql-js/sql.js
[2]:  https://sqlite.org/amalgamation.html
[3]:  https://www.sqlite.org/src/dir?ci=trunk&name=ext/misc
[4]:  https://sqlite.org/fts5.html
[5]:  https://github.com/jakethaw/pivot_vtab
[6]:  https://sqlite.org/series.html
[7]:  https://sqlite.org/src/file/ext/misc/series.c
[8]:  https://sqlite.org/src/file/ext/misc/closure.c
[9]:  https://sqlite.org/src/file/ext/misc/compress.c
[10]: https://sqlite.org/src/file/ext/misc/uuid.c
[11]: https://sqlite.org/src/file/ext/misc/regexp.c
[12]: https://sqlite.org/src/file/ext/misc/eval.c
