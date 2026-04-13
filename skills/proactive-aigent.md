---
name: proactive-aigent
description: Manage Telegram message schedules with natural language
---

# Proactive AIgent Skill

Conversational interface for managing Telegram message schedules.

## Usage

Users can interact using natural language:
- "Schedule 'Hello world' at 7 AM daily"
- "List my schedules"
- "Remove schedule #2"
- "Test schedule #1"
- "Configure my bot"

## Implementation

Parse user intent and map to CLI commands:

**Config:** `proactive-aigent config`
**Add:** `proactive-aigent add` (with interactive prompts)
**List:** `proactive-aigent list`
**Remove:** `proactive-aigent remove <id>`
**Test:** `proactive-aigent test <id>`

## Timezone

All times are Bangladesh time (GMT+6). CLI handles UTC conversion.

## Examples

### Schedule a message
User: "Schedule 'Good morning' at 7 AM every day"
Execute: Interactive add command with pre-filled values

### List schedules
User: "Show me my schedules"
Execute: `proactive-aigent list`

### Remove schedule
User: "Remove schedule #2"
Execute: `proactive-aigent remove 2`

### Test schedule
User: "Test schedule #1"
Execute: `proactive-aigent test 1`

## Error Handling

- Show CLI error messages to user
- Suggest running `proactive-aigent config` if config missing
- Format output for readability

## Important

- Always use Bash tool to execute CLI commands
- Never implement scheduling logic directly
- CLI handles all cron and database operations
