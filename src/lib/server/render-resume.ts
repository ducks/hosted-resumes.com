import { render } from 'svelte/server';
import type { Component } from 'svelte';
import type { JoblResume } from '$lib/jobl/schema';
import type { ThemeProps } from '$lib/themes/types';
import { getTheme, getDefaultTheme } from '$lib/themes';

// Render a resume to self-contained HTML suitable for PDF conversion.
// Uses Svelte's server-side render to produce the markup, then wraps
// it in a full HTML document with print-optimized CSS and @page rules.
export function renderResume(
  resume: JoblResume,
  themeId: string
): string {
  const entry = getTheme(themeId) ?? getDefaultTheme();
  const component = entry.component as Component<ThemeProps>;

  const { body, head } = render(component, {
    props: { resume },
  });

  return buildHtmlDocument(body, head);
}

function buildHtmlDocument(body: string, head: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${head}
  <style>
    @page {
      size: 8.5in 11in;
      margin: 0;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body>
  ${body}
</body>
</html>`;
}
