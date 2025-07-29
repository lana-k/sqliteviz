import logging
import re
import shutil
import subprocess
import sys
import tarfile
import zipfile
from io import BytesIO
from pathlib import Path
from urllib import request


amalgamation_url = 'https://sqlite.org/2025/sqlite-amalgamation-3500300.zip'

# Extension-functions
# ===================
# It breaks amalgamation if appended as other extension because it redefines
# several functions, so build it separately. Note that sql.js registers these
# extension functions by calling ``registerExtensionFunctions`` itself.
contrib_functions_url = 'https://sqlite.org/contrib/download/extension-functions.c?get=25'

extension_urls = (
    # Miscellaneous extensions
    # ========================
    ('https://sqlite.org/src/raw/e212edb2?at=series.c', 'sqlite3_series_init'),
    ('https://sqlite.org/src/raw/5559daf1?at=closure.c', 'sqlite3_closure_init'),
    ('https://sqlite.org/src/raw/5bb2264c?at=uuid.c', 'sqlite3_uuid_init'),
    ('https://sqlite.org/src/raw/388e7f23?at=regexp.c', 'sqlite3_regexp_init'),
    ('https://sqlite.org/src/raw/72e05a21?at=percentile.c', 'sqlite3_percentile_init'),
    ('https://sqlite.org/src/raw/228d47e9?at=decimal.c', 'sqlite3_decimal_init'),
    # Third-party extension
    # =====================
    ('https://github.com/jakethaw/pivot_vtab/raw/9323ef93/pivot_vtab.c', 'sqlite3_pivotvtab_init'),
    ('https://github.com/nalgeon/sqlean/raw/95e8d21a/src/pearson.c', 'sqlite3_pearson_init'),
    # Third-party extension with own dependencies
    # ===========================================
    ('https://github.com/kev82/sqlitelua/raw/db479510/src/main.c', 'sqlite3_luafunctions_init'),
)

lua_url = 'http://www.lua.org/ftp/lua-5.3.5.tar.gz'
sqlitelua_url = 'https://github.com/kev82/sqlitelua/archive/db479510.zip'

sqljs_url = 'https://github.com/sql-js/sql.js/archive/refs/tags/v1.7.0.zip'


def _generate_extra_init_c_function(init_function_names):
    auto_ext_calls = '\n'.join([
        'nErr += sqlite3_auto_extension((void*){});'.format(init_fn)
        for init_fn in init_function_names
    ])
    return '''
        int extra_init(const char* dummy)
        {
            int nErr = 0;
            %s
            return nErr ? SQLITE_ERROR : SQLITE_OK;
        }
    ''' % auto_ext_calls


def _get_amalgamation(tgt: Path):
    logging.info('Downloading and extracting SQLite amalgamation %s', amalgamation_url)
    archive = zipfile.ZipFile(BytesIO(request.urlopen(amalgamation_url).read()))
    archive_root_dir = zipfile.Path(archive, archive.namelist()[0])
    for zpath in archive_root_dir.iterdir():
        with zpath.open() as fr, (tgt / zpath.name).open('wb') as fw:
            shutil.copyfileobj(fr, fw)


def _get_lua(tgt: Path):
    # Library definitions from lua/Makefile
    lib_str = '''
        CORE_O=    lapi.o lcode.o lctype.o ldebug.o ldo.o ldump.o lfunc.o lgc.o llex.o \
            lmem.o lobject.o lopcodes.o lparser.o lstate.o lstring.o ltable.o \
            ltm.o lundump.o lvm.o lzio.o
        LIB_O=    lauxlib.o lbaselib.o lbitlib.o lcorolib.o ldblib.o liolib.o \
            lmathlib.o loslib.o lstrlib.o ltablib.o lutf8lib.o loadlib.o linit.o
        LUA_O=    lua.o
    '''
    header_only_files = {'lprefix', 'luaconf', 'llimits', 'lualib'}
    lib_names = set(re.findall(r'(\w+)\.o', lib_str)) | header_only_files

    logging.info('Downloading and extracting Lua %s', lua_url)
    archive = tarfile.open(fileobj=BytesIO(request.urlopen(lua_url).read()))
    (tgt / 'lua').mkdir()
    for tarinfo in archive:
        tarpath = Path(tarinfo.name)
        if tarpath.match('src/*') and tarpath.stem in lib_names:
            with (tgt / 'lua' / tarpath.name).open('wb') as fw:
                shutil.copyfileobj(archive.extractfile(tarinfo), fw)

    logging.info('Downloading and extracting SQLite Lua extension %s', sqlitelua_url)
    archive = zipfile.ZipFile(BytesIO(request.urlopen(sqlitelua_url).read()))
    archive_root_dir = zipfile.Path(archive, archive.namelist()[0])
    (tgt / 'sqlitelua').mkdir()
    for zpath in (archive_root_dir / 'src').iterdir():
        if zpath.name != 'main.c':
            with zpath.open() as fr, (tgt / 'sqlitelua' / zpath.name).open('wb') as fw:
                shutil.copyfileobj(fr, fw)


def _get_contrib_functions(tgt: Path):
    request.urlretrieve(contrib_functions_url, tgt / 'extension-functions.c')


def _get_extensions(tgt: Path):
    init_functions = []
    sqlite3_c = tgt / 'sqlite3.c'
    with sqlite3_c.open('ab') as f:
        for url, init_fn in extension_urls:
            logging.info('Downloading and appending to amalgamation %s', url)
            with request.urlopen(url) as resp:
                f.write(b'\n')
                shutil.copyfileobj(resp, f)
            init_functions.append(init_fn)

        logging.info('Appending SQLITE_EXTRA_INIT to amalgamation')
        f.write(_generate_extra_init_c_function(init_functions).encode())


def _get_sqljs(tgt: Path):
    logging.info('Downloading and extracting sql.js %s', sqljs_url)
    archive = zipfile.ZipFile(BytesIO(request.urlopen(sqljs_url).read()))
    archive_root_dir = zipfile.Path(archive, archive.namelist()[0])
    (tgt / 'sqljs').mkdir()
    for zpath in (archive_root_dir / 'src').iterdir():
        with zpath.open() as fr, (tgt / 'sqljs' / zpath.name).open('wb') as fw:
            shutil.copyfileobj(fr, fw)


def configure(tgt: Path):
    _get_amalgamation(tgt)
    _get_contrib_functions(tgt)
    _get_lua(tgt)
    _get_extensions(tgt)
    _get_sqljs(tgt)

    subprocess.check_call(['emcc', '--version'])


if __name__ == '__main__':
    if sys.version_info < (3, 8):
        print('Python 3.8 or higher is expected', file=sys.stderr)
        sys.exit(1)

    logging.basicConfig(level='INFO', format='%(asctime)s %(levelname)s %(name)s %(message)s')

    src = Path('src')
    src.mkdir()
    configure(src)
