#!/usr/bin/env python
# coding: utf-8

# In[ ]:


from anytree import Node, RenderTree
import markdown
from bs4 import BeautifulSoup
html = markdown.markdown(open("faq.md").read())
#txt = ("".join(BeautifulSoup(html).findAll(text=True)))
lines_list = html.split('\n')


# In[ ]:





# In[99]:


#If you want the HTML tags, use this part of the code.

# for line in lines_list:
#     if line.find("<h1>")!=-1:
#         h1 = Node(line)
#     elif line.find("<h2>")!=-1:
#         h2 = Node(line,parent=h1)
#     elif line.find("<h3>")!=-1:
#         h3 = Node(line,parent = h2)
#     else:
#         asw = Node(line,parent = h3)


# In[100]:


#If you don't want the HTML tags, use this part of the code.
for line in lines_list:
    if line.find("<h1>")!=-1:
        h1 = Node("".join(BeautifulSoup(line).findAll(text=True)))
    elif line.find("<h2>")!=-1:
        h2 = Node("".join(BeautifulSoup(line).findAll(text=True)),parent=h1)
    elif line.find("<h3>")!=-1:
        h3 = Node("".join(BeautifulSoup(line).findAll(text=True)),parent = h2)
    else:
        asw = Node("".join(BeautifulSoup(line).findAll(text=True)),parent = h3)


# In[101]:


# Print Tree
# for pre, fill, node in RenderTree(h1):
#     print("%s%s" % (pre, node.name))


# In[103]:


# Tree to JSON
# from anytree.exporter import JsonExporter
# exporter = JsonExporter(indent=2, sort_keys=False)
# treeJSON = exporter.export(h1)
# print(exporter.export(h1))


# In[104]:


# The formatted output
from anytree.exporter import DictExporter
from pprint import pprint
exporter = DictExporter()
output = exporter.export(h1)
faq=[]
for i in output:
    if i == 'children':
        temp = output[i]
        for t in temp:
            cate = t['name']
            for c in t['children']:
                q = c['name']
                a = [i['name'] for i in c['children']]
                obj = {"category":cate,"q":q,"a":a}
                #print(obj,'\n')
                faq.append(dict(obj))

print({"faq":faq})
#pprint(output)


# In[105]:


# Traverse tree here
# from anytree import PreOrderIter
# [node.name for node in PreOrderIter(h1)]


# In[ ]:




