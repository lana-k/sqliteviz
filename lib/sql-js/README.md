# SQLite WebAssembly build

This directory contains Docker-based build script, `make.sh`, that builds
a custom version of [sql.js][1]. It allows sqliteviz to have more recent
version of SQLite build with a number of useful extensions.

`Makefile` from [sql.js][1] is rewritten as more comprehensible `configure.py`
 and `build.py` Python scripts that run in `emscripten/emsdk` Docker container.

## Extension

SQLite [amalgamation][2] extensions included:

1. [FTS5][4] -- virtual table module that provides full-text search
   functionality

SQLite [miscellaneous extensions][3] included:

1. `generate_series` table-valued [series function][6] ([series.c][7])
2. `transitive_closure` virtual table ([closure.c][8])
3. `uuid`, `uuid_str` and `uuid_blob` RFC-4122 UUID functions ([uuid.c][9])
4. `regexp` function ([regexp.c][10])
5. `eval` function which runs SQL statements recursively ([eval.c][11])

SQLite 3rd party extensions included:

1. [pivot_vtab][5] -- a pivot virtual table

To ease the step to have working clone locally, the build is committed into
the repository.

## Build method

Basically it's extended amalgamation and `SQLITE_EXTRA_INIT` concisely
described in [this message from SQLite Forum][12]:

> Simply append it to the end of the amalgamation file. The real problem is
> how you get the init function called. The easiest way (to me at any rate) is
> to append a function (after the extensions you want to add are all appended)
> that adds the init function for each extension to the auto extension list
> for new connections, and set the pre-processor symbol SQLITE_EXTRA_INIT to
> the name of this function. [...]
>
> An example `SQLITE_EXTRA_INIT` function looks like this:
>
> ```
> int core_init(const char* dummy)
> {
>    int nErr = 0;
>
>    nErr += sqlite3_auto_extension((void*)sqlite3_autobusy_init);
>    nErr += sqlite3_auto_extension((void*)sqlite3_ipaddress_init);
>
>    return nErr ? SQLITE_ERROR : SQLITE_OK;
> }
> ```
>
> so you would then define `SQLITE_EXTRA_INIT=core_init` when compiling the
> amalgamation code and the extensions would thereafter be automatically
> initialized on each connection.

[1]:  https://github.com/sql-js/sql.js
[2]:  https://sqlite.org/amalgamation.html
[3]:  https://www.sqlite.org/src/dir?ci=trunk&name=ext/misc
[4]:  https://sqlite.org/fts5.html
[5]:  https://github.com/jakethaw/pivot_vtab
[6]:  https://sqlite.org/series.html
[7]:  https://sqlite.org/src/file/ext/misc/series.c
[8]:  https://sqlite.org/src/file/ext/misc/closure.c
[9]:  https://sqlite.org/src/file/ext/misc/uuid.c
[10]: https://sqlite.org/src/file/ext/misc/regexp.c
[11]: https://sqlite.org/src/file/ext/misc/eval.c
[12]: https://sqlite.org/forum/forumpost/6ad7d4f4bebe5e06?raw
