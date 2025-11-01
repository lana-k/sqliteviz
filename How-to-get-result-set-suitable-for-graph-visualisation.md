# How to get result set suitable for graph visualisation

There are some requirements for result sets if you want to build a graph.
Here is an example of building a query that returns a result set appropriate for graph visualisation.

Let's say, you have 2 tables:

house:
| name       | points |
| ---------- | ------ |
| Gryffindor | 100    |
| Hufflepuff | 90     |
| Ravenclaw  | 95     |
| Slytherin  | 80     |

student:
| id | name           | house      |
| -- | -------------- | ---------- |
| 1  | Harry Potter   | Gryffindor |
| 2  | Ron Weasley    | Gryffindor |
| 3  | Draco Malfoy'  | Slytherin  |
| 4  | Luna Lovegood  | Ravenclaw  |
| 5  | Cedric Diggory | Hufflepuff |

Each student belongs to a certain house. 
Let's say you want to build a graph with houses and students as nodes, where each house is linked with its students.

We are going to use [json_object][1] function to form JSONs. The result set should contain both nodes and edges and we have to provide a field indicating that (0 - for nodes and 1 - for edges). Let's provide it as 'object_type':

```sql
SELECT json_object('object_type', 0)
FROM house
UNION ALL
SELECT json_object('object_type', 0)
FROM student
UNION ALL
SELECT json_object('object_type', 1)
FROM student
```
Note that we included `student` table twice. That is because the table contains not only students but also their relationship to houses. 
So the first union will be used as node records and the second one - as edges.

Then we need to provide an ID for each node. For students - `id` and for houses - `name`: 

```sql
SELECT json_object('object_type', 0, 'node_id', name)
FROM house
UNION ALL
SELECT json_object('object_type', 0, 'node_id', id)
FROM student
UNION ALL
SELECT json_object('object_type', 1)
FROM student
```

Each edge record must specify where it starts and where it ends. Let's provide it as `source` and `target`.
Provide values that are used as node IDs. In our case it's house names and student IDs:

```sql
SELECT json_object('object_type', 0, 'node_id', name)
FROM house
UNION ALL
SELECT json_object('object_type', 0, 'node_id', id)
FROM student
UNION ALL
SELECT json_object('object_type', 1, 'source', house, 'target', id)
FROM student
```
Basically, that is enough to build a graph. But it won't be meaningfull without lables.
Also, it would be nice to distinguish house nodes from student nodes e.g. by color.
Let's put additional fields - `label` and `type` that can be used in graph styling.

```sql
SELECT json_object('object_type', 0, 'node_id', name, 'label', name, 'type', 'house')
FROM house
UNION ALL
SELECT json_object('object_type', 0, 'node_id', id, 'label', name, 'type', 'student')
FROM student
UNION ALL
SELECT json_object('object_type', 1, 'source', house, 'target', id)
FROM student
```

Run the query, the result set will look like this:

| json_object('object_type', 0, 'node_id', name, 'label', name, 'type', 'house') |
| ------------------------------------------------------------------------------ |
| {"object_type":0,"node_id":"Gryffindor","label":"Gryffindor","type":"house"}   |
| {"object_type":0,"node_id":"Hufflepuff","label":"Hufflepuff","type":"house"}   |
| {"object_type":0,"node_id":"Ravenclaw","label":"Ravenclaw","type":"house"}     |
| {"object_type":0,"node_id":"Slytherin","label":"Slytherin","type":"house"}     |
| {"object_type":0,"node_id":1,"label":"Harry Potter","type":"student"}          |
| {"object_type":0,"node_id":2,"label":"Ron Weasley","type":"student"}           |
| {"object_type":0,"node_id":3,"label":"Draco Malfoy","type":"student"}          |
| {"object_type":0,"node_id":4,"label":"Luna Lovegood","type":"student"}         |
| {"object_type":0,"node_id":5,"label":"Cedric Diggory","type":"student"}        |
| {"object_type":1,"node_source":"Gryffindor","target":1}                        |
| {"object_type":1,"node_source":"Gryffindor","target":2}                        |
| {"object_type":1,"node_source":"Slytherin","target":3}                         |
| {"object_type":1,"node_source":"Ravenclaw","target":4}                         |
| {"object_type":1,"node_source":"Hufflepuff","target":5}                        |
