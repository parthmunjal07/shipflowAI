function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, "");
}

export function findDiffPosition(patch: string, snippet: string): number | null {
  const patchLines = patch.split("\n");
  const firstHunkIndex = patchLines.findIndex((line) => line.startsWith("@@"));

  if (firstHunkIndex === -1) return null;

  const snippetLines = snippet.split("\n").filter((l) => l.trim().length > 0);
  if (snippetLines.length === 0) return null;

  const normalizedSnippetLines = snippetLines.map(normalizeWhitespace);

  // Extract clean code lines from the patch (skipping hunk headers and metadata), keeping track of their original line index.
  const cleanPatchData: { index: number; normalized: string }[] = [];

  for (let i = firstHunkIndex + 1; i < patchLines.length; i++) {
    const pLine = patchLines[i];
    if (!pLine) continue;
    
    // Skip hunk headers and metadata inside the patch
    if (pLine.startsWith("@@") || pLine.startsWith("\\")) {
      continue;
    }

    // Strip the unified diff prefix (+, -, space)
    const cleanPLine =
      pLine.length > 0 && ["+", "-", " "].includes(pLine[0] as string)
        ? pLine.substring(1)
        : pLine;

    cleanPatchData.push({
      index: i,
      normalized: normalizeWhitespace(cleanPLine),
    });
  }

  // 1. Attempt exact block match
  // We want to return the position of the *last* line of the matched snippet.
  for (let i = 0; i <= cleanPatchData.length - normalizedSnippetLines.length; i++) {
    let match = true;
    for (let j = 0; j < normalizedSnippetLines.length; j++) {
      const data = cleanPatchData[i + j];
      const snippetLine = normalizedSnippetLines[j];
      if (!data || !snippetLine || !data.normalized.includes(snippetLine)) {
        match = false;
        break;
      }
    }

    if (match) {
      const lastLineData = cleanPatchData[i + normalizedSnippetLines.length - 1];
      if (lastLineData) {
        return lastLineData.index - firstHunkIndex;
      }
    }
  }

  // 2. Fallback: Match longest unique line
  // If full block match fails (e.g. AI skipped a line), try to match just the longest line in the snippet
  const longestSnippetLine = [...normalizedSnippetLines].sort(
    (a, b) => b.length - a.length
  )[0];

  if (longestSnippetLine && longestSnippetLine.length > 10) {
    for (const data of cleanPatchData) {
      if (data.normalized.includes(longestSnippetLine)) {
        return data.index - firstHunkIndex;
      }
    }
  }

  return null;
}
