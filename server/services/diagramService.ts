import { DecisionAnalysis } from "./llmService";

/**
 * Generate a Mermaid diagram for decision tree visualization
 */
export function generateDecisionTreeDiagram(analysis: DecisionAnalysis): string {
  // Create a flowchart showing the decision tree
  const lines: string[] = ["graph TD"];

  // Start node
  lines.push('  Start["🎯 Decision Problem<br/>' + sanitizeLabel(analysis.problem) + '"]');

  // Key factors
  lines.push('  Factors["📊 Key Factors"]');
  lines.push("  Start --> Factors");

  // Options nodes
  const optionIds: string[] = [];
  analysis.options.forEach((opt, idx) => {
    const optId = `Opt${idx}`;
    optionIds.push(optId);
    lines.push(
      `  ${optId}["${sanitizeLabel(opt.name)}<br/>${sanitizeLabel(opt.description)}<br/>"]`
    );
    lines.push(`  Factors --> ${optId}`);
  });

  // Pros/Cons analysis
  const prosConsIds: string[] = [];
  analysis.prosAndCons.forEach((item, idx) => {
    const prosId = `Pros${idx}`;
    const consId = `Cons${idx}`;
    prosConsIds.push(prosId);
    prosConsIds.push(consId);

    const prosText = item.pros.slice(0, 2).join("<br/>"); // Limit to 2 items for readability
    const consText = item.cons.slice(0, 2).join("<br/>");

    lines.push(`  ${prosId}["✅ Pros<br/>${sanitizeLabel(prosText)}"]`);
    lines.push(`  ${consId}["❌ Cons<br/>${sanitizeLabel(consText)}"]`);

    const optIdx = analysis.options.findIndex((o) => o.name === item.option);
    if (optIdx >= 0) {
      lines.push(`  Opt${optIdx} --> ${prosId}`);
      lines.push(`  Opt${optIdx} --> ${consId}`);
    }
  });

  // Recommendation node
  lines.push(
    '  Recommendation["🎯 Recommendation<br/>' +
      sanitizeLabel(analysis.recommendation) +
      '"]'
  );
  optionIds.forEach((optId) => {
    lines.push(`  ${optId} --> Recommendation`);
  });

  return lines.join("\n");
}

/**
 * Generate a Mermaid diagram showing pros/cons comparison
 */
export function generateProConsComparisonDiagram(
  analysis: DecisionAnalysis
): string {
  const lines: string[] = ["graph LR"];

  lines.push('  Decision["🎯 ' + sanitizeLabel(analysis.problem) + '"]');

  analysis.prosAndCons.forEach((item, idx) => {
    const optionName = sanitizeLabel(item.option);
    const optId = `Opt${idx}`;

    lines.push(`  ${optId}["${optionName}"]`);
    lines.push(`  Decision --> ${optId}`);

    // Pros
    item.pros.forEach((pro, pIdx) => {
      const proId = `Pro${idx}_${pIdx}`;
      lines.push(`  ${proId}["✅ ${sanitizeLabel(pro)}"]`);
      lines.push(`  ${optId} --> ${proId}`);
    });

    // Cons
    item.cons.forEach((con, cIdx) => {
      const conId = `Con${idx}_${cIdx}`;
      lines.push(`  ${conId}["❌ ${sanitizeLabel(con)}"]`);
      lines.push(`  ${optId} --> ${conId}`);
    });
  });

  return lines.join("\n");
}

/**
 * Sanitize text for Mermaid diagram labels
 */
function sanitizeLabel(text: string): string {
  // Remove special characters and limit length
  return text
    .substring(0, 50)
    .replace(/"/g, "'")
    .replace(/\n/g, " ")
    .replace(/[<>]/g, "");
}

/**
 * Generate SVG diagram using mermaid-cli (requires external tool)
 * This would be called on the server side to generate static diagrams
 */
export async function generateDiagramSVG(
  mermaidCode: string,
  outputPath: string
): Promise<void> {
  // This would use the manus-render-diagram utility
  // For now, we'll just return the mermaid code that can be rendered client-side
  console.log("Diagram code generated for rendering:", mermaidCode);
}
