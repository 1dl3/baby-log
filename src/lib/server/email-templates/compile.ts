import mjml2html from 'mjml';
import fs from 'fs';
import path from 'path';

export function compileTemplate(templateName: string, variables: Record<string, string>): string {
  const templatePath = path.join(process.cwd(), 'src/lib/server/email-templates', `${templateName}.mjml`);
  const template = fs.readFileSync(templatePath, 'utf-8');
  
  // Replace variables in the template
  const templateWithVariables = Object.entries(variables).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`{{${key}}}`, 'g'), value),
    template
  );

  // Compile MJML to HTML
  const { html } = mjml2html(templateWithVariables);
  return html;
} 