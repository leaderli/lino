---
tags:
  - python/log
date updated: 2022-04-14 11:59
---


```python
import logging  
  

logging.basicConfig(format='%(message)s')  
  
  

logging.root.setLevel(logging.DEBUG)  
logging.debug('test')  
logging.info('test')



log = logging.getLogger('record')  
log.setLevel(level=logging.INFO)  
  
# create formatter and add it to the handlers  
formatter = logging.Formatter('%(asctime)s  %(message)s')  
  
# create file handler for logger.  
fh = logging.FileHandler('SPOT.log')  
fh.setLevel(level=logging.DEBUG)  
fh.setFormatter(formatter)  

  
# add handlers to logger.  
log.addHandler(fh)
# 类似 log4j 的 additivity
log.propagate  =False
```