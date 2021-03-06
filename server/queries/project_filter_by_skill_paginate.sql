SELECT
  project.id AS project_id,
  project.name AS project_name,
  project.owner AS project_owner,
  project.description as project_description,
  project.category as project_category,
  array_agg(json_build_object('skill_id', project_skills.id, 'name', project_skills.skill)) AS skills
from project
LEFT OUTER JOIN project_skills on project.name = project_skills.project
WHERE project.id != 1 AND project.id < $1 AND project.pinned = false AND project_skills.skill = $2
GROUP BY project_id, project_name, project_description, project_category
ORDER BY project.create_date DESC LIMIT 10
