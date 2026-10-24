import sqlite3, json
con = sqlite3.connect('school.db')
con.row_factory = sqlite3.Row
cur = con.execute('SELECT id, data FROM exams WHERE data LIKE "%subScores%" LIMIT 3')
for row in cur.fetchall():
    print('id:', row['id'])
    d = json.loads(row['data'])
    print('subScores:', d.get('subScores'))
    print('---')
con.close()