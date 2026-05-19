import { Project, SyntaxKind, FunctionDeclaration, ArrowFunction, JsxText } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths('src/pages/**/*.tsx');
project.addSourceFilesAtPaths('src/components/**/*.tsx');

let changedFiles = 0;

project.getSourceFiles().forEach(sourceFile => {
  let modified = false;

  // Find all JSX Texts
  const jsxTexts = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
  const labelsToReplace: Array<{ node: JsxText, text: string }> = [];

  jsxTexts.forEach(jsxText => {
    const text = jsxText.getLiteralText();
    // Trim and check if it has alphabet characters
    const trimmed = text.trim();
    if (trimmed.length > 1 && /[A-Za-z]/.test(trimmed) && !trimmed.includes('{') && !trimmed.includes('}')) {
      labelsToReplace.push({ node: jsxText, text: trimmed });
    }
  });

  // Also replace some JSX attributes like label="..." or title="..." or placeholder="..."
  const jsxAttributes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute);
  const attrsToReplace: any[] = [];
  jsxAttributes.forEach(attr => {
    const name = attr.getNameNode().getText();
    if (['label', 'title', 'placeholder', 'description'].includes(name)) {
      const init = attr.getInitializer();
      if (init && init.getKind() === SyntaxKind.StringLiteral) {
        attrsToReplace.push({ attr, init });
      }
    }
  });


  if (labelsToReplace.length > 0 || attrsToReplace.length > 0) {
    modified = true;
    
    // Convert JsxText to JsxExpression
    labelsToReplace.forEach(({ node, text }) => {
      try {
        const fullText = node.getText();
        const startSpace = fullText.match(/^\s*/)?.[0] || '';
        const endSpace = fullText.match(/\s*$/)?.[0] || '';
        
        // Escape quotes
        const escapedText = text.replace(/'/g, "\\'").replace(/"/g, '\\"');
        node.replaceWithText(`${startSpace}{t('${escapedText}')}${endSpace}`);
      } catch (e) {
         // ignore
      }
    });

    attrsToReplace.forEach(({ attr, init }) => {
      try {
        const text = init.getLiteralText();
        const escapedText = text.replace(/'/g, "\\'").replace(/"/g, '\\"');
        init.replaceWithText(`{t('${escapedText}')}`);
      } catch (e) {
      }
    });

    // Add import
    const hasImport = sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === 'react-i18next');
    if (!hasImport) {
      sourceFile.addImportDeclaration({
        namedImports: ['useTranslation'],
        moduleSpecifier: 'react-i18next'
      });
    }

    // Inject const { t } = useTranslation(); into the main component
    const defaultExport = sourceFile.getDefaultExportSymbol();
    if (defaultExport) {
        const decls = defaultExport.getDeclarations();
        if (decls.length > 0) {
            const decl = decls[0];
            const type = decl.getType();
            // Finding the function body
            let funcNode = null;
            if (decl.getKind() === SyntaxKind.FunctionDeclaration) {
                funcNode = decl as FunctionDeclaration;
            } else if (decl.getKind() === SyntaxKind.VariableDeclaration) {
                const init = (decl as any).getInitializer();
                if (init && (init.getKind() === SyntaxKind.ArrowFunction || init.getKind() === SyntaxKind.FunctionExpression)) {
                   funcNode = init as ArrowFunction;
                }
            }

            if (funcNode) {
                const body = (funcNode as any).getBody();
                if (body && body.getKind() === SyntaxKind.Block) {
                    const blockText = body.getText();
                    if (!blockText.includes('useTranslation()')) {
                        (funcNode as any).insertStatements(0, 'const { t } = useTranslation();');
                    }
                }
            }
        }
    } else {
        // Find exported function
        const exportedFuncs = sourceFile.getFunctions().filter(f => f.hasExportKeyword());
        if (exportedFuncs.length > 0) {
             const funcNode = exportedFuncs[0];
             const body = funcNode.getBody();
             if (body && body.getKind() === SyntaxKind.Block) {
                    const blockText = body.getText();
                    if (!blockText.includes('useTranslation()')) {
                        funcNode.insertStatements(0, 'const { t } = useTranslation();');
                    }
                }
        } else {
            // Find arbitrary function that returns JSX
            const funcs = sourceFile.getFunctions();
            for (const f of funcs) {
                const body = f.getBody();
                 if (body && body.getKind() === SyntaxKind.Block) {
                    if (body.getText().includes('return <') || body.getText().includes('return (')) {
                         if (!body.getText().includes('useTranslation()')) {
                             f.insertStatements(0, 'const { t } = useTranslation();');
                             break;
                         }
                    }
                 }
            }
        }
    }
  }

  if (modified) {
    console.log("Modified: " + sourceFile.getFilePath());
    // Quick fix for any duplicate imports
    changedFiles++;
  }
});

project.saveSync();
console.log(`Updated ${changedFiles} files.`);
