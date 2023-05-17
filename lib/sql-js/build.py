import logging
import subprocess
from pathlib import Path

# See the setting descriptions on these pages:
# - https://emscripten.org/docs/optimizing/Optimizing-Code.html
# - https://github.com/emscripten-core/emscripten/blob/main/src/settings.js
cflags = (
    # SQLite configuration
    '-DSQLITE_DEFAULT_CACHE_SIZE=-65536',  # 64 MiB
    '-DSQLITE_DEFAULT_MEMSTATUS=0',
    '-DSQLITE_DEFAULT_SYNCHRONOUS=0',
    '-DSQLITE_DISABLE_LFS',
    '-DSQLITE_DQS=0',
    '-DSQLITE_ENABLE_FTS3',
    '-DSQLITE_ENABLE_FTS3_PARENTHESIS',
    '-DSQLITE_ENABLE_FTS5',
    '-DSQLITE_ENABLE_NORMALIZE',
    '-DSQLITE_EXTRA_INIT=extra_init',
    '-DSQLITE_OMIT_DEPRECATED',
    '-DSQLITE_OMIT_LOAD_EXTENSION',
    '-DSQLITE_OMIT_SHARED_CACHE',
    '-DSQLITE_THREADSAFE=0',
    # Compile-time optimisation
    '-Os',  # reduces the code size about in half comparing to -O2
    '-flto',
)
emflags = (
    # Base
    '--memory-init-file', '0',
    '-s', 'ALLOW_TABLE_GROWTH=1',
    # WASM
    '-s', 'WASM=1',
    '-s', 'ALLOW_MEMORY_GROWTH=1',
    '-s', 'ENVIRONMENT=web,worker',
    # Link-time optimisation
    '-Os',
    '-flto',
    # sql.js
    '-s', 'EXPORTED_FUNCTIONS=@src/sqljs/exported_functions.json',
    '-s', 'EXPORTED_RUNTIME_METHODS=@src/sqljs/exported_runtime_methods.json',
    '--pre-js', 'src/sqljs/api.js',
)


def build(src: Path, dst: Path):
    out = Path('out')
    out.mkdir()

    logging.info('Building LLVM bitcode for sqlite3.c')
    subprocess.check_call([
        'emcc',
        *cflags,
        '-c', src / 'sqlite3.c',
        '-o', out / 'sqlite3.o',
    ])
    logging.info('Building LLVM bitcode for extension-functions.c')
    subprocess.check_call([
        'emcc',
        *cflags,
        '-c', src / 'extension-functions.c',
        '-o', out / 'extension-functions.o',
    ])

    logging.info('Building WASM from bitcode')
    subprocess.check_call([
        'emcc',
        *emflags,
        out / 'sqlite3.o',
        out / 'extension-functions.o',
        '-o', out / 'sql-wasm.js',
    ])

    logging.info('Post-processing build and copying to dist')
    (out / 'sql-wasm.wasm').rename(dst / 'sql-wasm.wasm')
    with (dst / 'sql-wasm.js').open('w') as f:
        f.write((src / 'sqljs' / 'shell-pre.js').read_text())
        f.write((out / 'sql-wasm.js').read_text())
        f.write((src / 'sqljs' / 'shell-post.js').read_text())


if __name__ == '__main__':
    logging.basicConfig(level='INFO', format='%(asctime)s %(levelname)s %(name)s %(message)s')

    src = Path('src')
    dst = Path('dist')
    dst.mkdir()
    build(src, dst)
