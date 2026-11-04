"""Copy only the user's saved AgentOS Groq credential into ignored local env.

Requires the AgentOS virtual environment; never prints credentials or updates AgentOS.
"""
from pathlib import Path
import sqlite3
import json
import re
import sys
from dotenv import load_dotenv

source = Path(r'D:\Hashim\agentOS\backend')
target = Path(__file__).resolve().parents[1] / '.env.local'
load_dotenv(source / '.env', override=True)
sys.path.insert(0, str(source))
from provider_access import decrypt_key

def main():
    database = source / 'agentOS_public.db'
    with sqlite3.connect(f'file:{database.as_posix()}?mode=ro', uri=True) as db:
        row = db.execute("SELECT model, encrypted_key FROM shared_providers WHERE id = ?", ('groq',)).fetchone()
    if not row or not row[1]:
        raise ValueError('No shared Groq credential found')
    key = decrypt_key(row[1])
    if not key.startswith('gsk_'):
        raise ValueError('Unexpected credential format')
    content = target.read_text(encoding='utf-8')
    for name, value in [('GROQ_API_KEY', key), ('GROQ_MODEL', row[0])]:
        line = name + '=' + value
        content = re.sub(r'^' + name + r'=.*$', lambda _: line, content, flags=re.M) if re.search(r'^' + name + r'=', content, re.M) else content.rstrip() + '\n' + line + '\n'
    target.write_text(content, encoding='utf-8')
    print(json.dumps({'copied': True, 'model': row[0], 'key_printed': False}))

try:
    main()
except Exception as error:
    print(json.dumps({'copied': False, 'error_type': type(error).__name__}))
    sys.exit(1)
