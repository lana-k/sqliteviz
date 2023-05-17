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
2. [FTS3/FTS4][15] -- older virtual table modules for full-text search
3. [JSON1][16] -- scalar, aggregate and table-valued functions for managing JSON data

SQLite [contribution extensions][17]:

1. [extension-functions][18] -- mathematical and string extension functions for SQL queries.

   Math: `acos`, `asin`, `atan`, `atn2`, `atan2`, `acosh`, `asinh`, `atanh`, `difference`,
   `degrees`, `radians`, `cos`, `sin`, `tan`, `cot`, `cosh`, `sinh`, `tanh`, `coth`,
   `exp`, `log`, `log10`, `power`, `sign`, `sqrt`, `square`, `ceil`, `floor`, `pi`.

   String: `replicate`, `charindex`, `leftstr`, `rightstr`, `ltrim`, `rtrim`, `trim`,
   `replace`, `reverse`, `proper`, `padl`, `padr`, `padc`, `strfilter`.

   Aggregate: `stdev`, `variance`, `mode`, `median`, `lower_quartile`, `upper_quartile`.

SQLite [miscellaneous extensions][3] included:

1. `generate_series` table-valued [series function][6] ([series.c][7])
2. `transitive_closure` virtual table for
   [Querying Tree Structures in SQLite][11] ([closure.c][8])
3. `uuid`, `uuid_str` and `uuid_blob` RFC-4122 UUID functions ([uuid.c][9])
4. `regexp` (hence `REGEXP` operator) and `regexpi` functions ([regexp.c][10])
5. `percentile` function ([percentile.c][13])
6. `decimal`, `decimal_cmp`, `decimal_add`, `decimal_sub` and `decimal_mul` functions
   ([decimal.c][14])

SQLite 3rd party extensions included:

1. [pivot_vtab][5] -- a pivot virtual table
2. `pearson` correlation coefficient function extension from [sqlean][21]
   (which is part of [squib][20])

To ease the step to have working clone locally, the build is committed into
the repository.

Examples of queries involving these extensions can be found in the test suite in
[sqliteExtensions.spec.js][19].

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
[3]:  https://sqlite.org/src/dir?ci=trunk&name=ext/misc
[4]:  https://sqlite.org/fts5.html
[5]:  https://github.com/jakethaw/pivot_vtab
[6]:  https://sqlite.org/series.html
[7]:  https://sqlite.org/src/file/ext/misc/series.c
[8]:  https://sqlite.org/src/file/ext/misc/closure.c
[9]:  https://sqlite.org/src/file/ext/misc/uuid.c
[10]: https://sqlite.org/src/file/ext/misc/regexp.c
[11]: https://charlesleifer.com/blog/querying-tree-structures-in-sqlite-using-python-and-the-transitive-closure-extension/
[12]: https://sqlite.org/forum/forumpost/6ad7d4f4bebe5e06?raw
[13]: https://sqlite.org/src/file/ext/misc/percentile.c
[14]: https://sqlite.org/src/file/ext/misc/decimal.c
[15]: https://sqlite.org/fts3.html
[16]: https://sqlite.org/json1.html
[17]: https://sqlite.org/contrib/
[18]: https://sqlite.org/contrib//download/extension-functions.c?get=25
[19]: https://github.com/lana-k/sqliteviz/blob/master/tests/lib/database/sqliteExtensions.spec.js
[20]: https://github.com/mrwilson/squib/blob/master/pearson.c
[21]: https://github.com/nalgeon/sqlean/blob/incubator/src/pearson.c
