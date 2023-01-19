<!-- This README file is going to be the one displayed on the Grafana.com website for your plugin -->

# Tree

Tree view plugin

Turns hierarchy data tables into tree panel. Example tables like:

```sql
CREATE TABLE entity
(
    id   int,
    name varchar
);

CREATE TABLE relation
(
    parent_id int,
    child_id  int
);

insert into entity values (1, 'hello'), (2, 'world'), (3, '!!');
insert into relation values (1, 2), (2, 3);

WITH RECURSIVE cte(parent_id, child_id, path) as (
    select null::int, id, name, 0::int as level
    from entity as parent
    where id not in (select child_id from relation)
    union all
    select relation.parent_id, relation.child_id, cte.path||','||child.name, cte.level+1
    from relation
    inner join entity child on child.id = relation.child_id
    inner join cte on cte.child_id = relation.parent_id
)
select * from cte where level = (select max(level) from cte)
```

The format of the path can be:

1. id
2. id:name
3. id:name:type
