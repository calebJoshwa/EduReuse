import sqlite3

conn = sqlite3.connect('db.sqlite3')
c = conn.cursor()
print('TABLES:', c.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall())
for t in ['api_book','api_favorite','api_cart','auth_user','api_profile','api_book']:
    try:
        print(t, c.execute(f"SELECT COUNT(*) FROM {t};").fetchone())
    except Exception as e:
        print(t, 'ERR', e)
conn.close()