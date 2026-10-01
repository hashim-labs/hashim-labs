import fitz
from pathlib import Path
for path in [Path('public/Hashim Resume.pdf'), Path('public/cv/resume.pdf'), Path('public/My_Resume.pdf')]:
 doc=fitz.open(path)
 print('\nFILE:',path,'PAGES:',len(doc))
 print('\n'.join(p.get_text() for p in doc)[:12000])
 print('IMAGES:',sum(len(p.get_images()) for p in doc))
 doc[0].get_pixmap(matrix=fitz.Matrix(1.2,1.2)).save('artifacts/'+path.stem.replace(' ','-')+'-cv-preview.png')
