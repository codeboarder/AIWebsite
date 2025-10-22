# Security Policy

## Reporting a Vulnerability

If you believe you’ve found a security vulnerability in this project, please open a private disclosure if possible, or alternatively open an issue with the “security” label and a minimal reproduction. Do not include secrets in issues or pull requests.

## Supported Versions

This is a personal/demo project; security updates are applied on a best-effort basis. Dependabot is enabled to keep dependencies up to date.

## Best Practices

- Never commit secrets (.env / keys).  
- Rotate credentials periodically.  
- Use least-privilege on any deployed infrastructure.  
- Consider adding CI checks for secret scanning and linting before production use.
