# n8n Workflow Builder

Use this skill when working with n8n nodes, workflow JSON, Edit Fields, Code nodes, IF nodes, Google Sheets nodes, or AI Agent prompts.

Rules:

- Preserve existing node behavior unless explicitly asked to change it.
- Do not create new sheets unless explicitly requested.
- Keep JSON valid.
- Explain changes node by node.
- For Code nodes, return complete replacement code.
- For expressions, avoid unsafe escaping.
- For Google Sheets, normalize columns and avoid breaking existing mappings.
